import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const queuePath = path.resolve("execution", "queue.json");
const now = new Date().toISOString();

function hashId(platform, type, title, content) {
  return crypto.createHash("sha1").update(`${platform}|${type}|${title}|${content}`).digest("hex").slice(0, 12);
}

function extractTitle(raw, fallback) {
  const titleMatch = raw.match(/<title>(.*?)<\/title>/is) || raw.match(/^#\s+(.+)$/m) || raw.match(/【标题】\s*\n?(.+)/);
  return titleMatch ? titleMatch[1].trim() : fallback;
}

function keywordsFor(platform, content) {
  const base = ["帽子供应链", "源头工厂", "48小时发货"];
  const extra = [];
  if (/直播|抖音/.test(content)) extra.push("直播供货帽子");
  if (/OEM|ODM|LOGO|定制/.test(content)) extra.push("帽子OEM定制");
  if (/1688|批发|商品/.test(content)) extra.push("帽子批发");
  if (platform === "wechat") extra.push("公众号帽子供应链");
  return [...new Set([...base, ...extra])];
}

function makeItem({ platform, type, title, content, source_file, publish_mode = "manual" }) {
  const keywords = keywordsFor(platform, content);
  return {
    id: hashId(platform, type, title, content),
    platform,
    type,
    title,
    content,
    status: "pending",
    publish_mode,
    seo: {
      keywords,
      description: `${title}｜洛阳兴琪针织有限公司，帽子全品类源头供应链工厂，支持混批、OEM/ODM和常规现货48小时内发货。`
    },
    review: true,
    action: "approve / reject",
    source_file,
    created_at: now,
    updated_at: now
  };
}

async function readIfExists(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(full));
    if (entry.isFile() && /\.(html|md)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const files = [
  ...await collectFiles(path.resolve("site")),
  ...await collectFiles(path.resolve("publish-content")),
  ...await collectFiles(path.resolve("generated"))
];

const items = [];
for (const file of files) {
  const content = await readIfExists(file);
  if (!content) continue;

  const normalized = file.replaceAll("\\", "/");
  let platform = "website";
  let type = "seo_page";
  let publish_mode = "auto";

  if (normalized.includes("1688")) {
    platform = "1688";
    type = "product";
    publish_mode = "manual";
  } else if (normalized.includes("douyin")) {
    platform = "douyin";
    type = "video_script";
    publish_mode = "manual";
  } else if (normalized.includes("wechat")) {
    platform = "wechat";
    type = "article";
    publish_mode = "manual";
  } else if (normalized.includes("ai-quote")) {
    platform = "website";
    type = "faq";
    publish_mode = "auto";
  }

  items.push(makeItem({
    platform,
    type,
    title: extractTitle(content, path.basename(file)),
    content,
    source_file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
    publish_mode
  }));
}

const existing = JSON.parse(await readIfExists(queuePath) || "[]");
const map = new Map(existing.map(item => [item.id, item]));
for (const item of items) {
  if (!map.has(item.id)) map.set(item.id, item);
}

await fs.mkdir(path.dirname(queuePath), { recursive: true });
await fs.writeFile(queuePath, JSON.stringify([...map.values()], null, 2), "utf8");
console.log(`queued ${items.length} content records into ${queuePath}`);
