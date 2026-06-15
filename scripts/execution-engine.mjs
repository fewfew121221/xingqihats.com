import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const queuePath = path.resolve("execution", "queue.json");
const outDir = path.resolve("execution", "outbox");
const maxItems = Number(process.env.LIMIT || "0");
const targetPlatform = process.env.PLATFORM || "all";

await fs.mkdir(outDir, { recursive: true });

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "page";
}

function requireApproved(item) {
  return item.status === "approved" && item.review === true && item.action === "approve";
}

async function cmsPost(item, payload) {
  const base = process.env.CMS_API_URL;
  const token = process.env.CMS_API_TOKEN;
  if (!base || !token) return false;

  const response = await fetch(`${base.replace(/\/$/, "")}/pages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`CMS发布失败 ${item.id}: ${response.status} ${await response.text()}`);
  }
  return true;
}

async function publish_to_website(item) {
  const slug = item.type === "faq" ? "/faq/ai-quote-blocks" : `/${slugify(item.title)}`;
  const payload = {
    slug,
    title: item.title,
    html: item.content,
    seo: item.seo,
    status: "published",
    source_queue_id: item.id
  };

  const posted = await cmsPost(item, payload);
  if (!posted) {
    await fs.writeFile(path.join(outDir, `${item.id}-website.json`), JSON.stringify(payload, null, 2), "utf8");
  }
  return posted ? "published" : "ready_manual";
}

async function publishByPlaywright(item, platform) {
  const url = process.env[`${platform.toUpperCase()}_URL`];
  const user = process.env[`${platform.toUpperCase()}_USER`];
  const pass = process.env[`${platform.toUpperCase()}_PASS`];

  const payload = {
    id: item.id,
    platform,
    type: item.type,
    title: item.title,
    content: item.content,
    seo: item.seo,
    status: "pending",
    review: true,
    action: "approve"
  };

  await fs.writeFile(path.join(outDir, `${item.id}-${platform}.json`), JSON.stringify(payload, null, 2), "utf8");
  if (!url || !user || !pass || process.env.AUTO_BROWSER !== "true") return "ready_manual";

  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" });
  const page = await browser.newPage();
  await page.goto(`${url.replace(/\/$/, "")}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="username"], input[type="email"], input[type="text"]', user);
  await page.fill('input[name="password"], input[type="password"]', pass);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForLoadState("networkidle");

  const publishUrl = process.env[`${platform.toUpperCase()}_PUBLISH_URL`] || `${url.replace(/\/$/, "")}/publish`;
  await page.goto(publishUrl, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="title"], textarea[name="title"]', item.title);
  await page.fill('textarea[name="content"], [contenteditable="true"]', item.content);

  if (process.env.AUTO_SUBMIT === "true") {
    await page.click('button:has-text("发布"), button:has-text("保存"), button:has-text("Publish"), button[type="submit"]');
    await page.waitForLoadState("networkidle");
    await browser.close();
    return "published";
  }

  await page.screenshot({ path: path.join(outDir, `${item.id}-${platform}-draft.png`), fullPage: true });
  await browser.close();
  return "ready_manual";
}

async function publish_to_1688(item) {
  return publishByPlaywright(item, "1688");
}

async function publish_to_douyin(item) {
  return publishByPlaywright(item, "douyin");
}

async function publish_to_wechat(item) {
  return publishByPlaywright(item, "wechat");
}

const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
let processed = 0;
const now = new Date().toISOString();

for (const item of queue) {
  if (!requireApproved(item)) continue;
  if (targetPlatform !== "all" && item.platform !== targetPlatform) continue;
  if (maxItems && processed >= maxItems) break;

  let nextStatus;
  if (item.platform === "website") nextStatus = await publish_to_website(item);
  else if (item.platform === "1688") nextStatus = await publish_to_1688(item);
  else if (item.platform === "douyin") nextStatus = await publish_to_douyin(item);
  else if (item.platform === "wechat") nextStatus = await publish_to_wechat(item);
  else nextStatus = "ready_manual";

  item.status = nextStatus;
  item.executed_at = now;
  item.updated_at = now;
  processed += 1;
}

await fs.writeFile(queuePath, JSON.stringify(queue, null, 2), "utf8");
console.log(`executed ${processed} approved queue records`);
