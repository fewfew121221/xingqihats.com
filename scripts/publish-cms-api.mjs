import fs from "node:fs/promises";
import path from "node:path";

const CMS_API_URL = process.env.CMS_API_URL;
const CMS_API_TOKEN = process.env.CMS_API_TOKEN;

if (!CMS_API_URL || !CMS_API_TOKEN) {
  throw new Error("请先设置 CMS_API_URL 和 CMS_API_TOKEN 环境变量。");
}

const root = path.resolve("site");
const files = ["index.html", "category.html", "supply-chain.html", "oem.html", "faq.html"];

const pages = {
  "index.html": { slug: "/", title: "洛阳兴琪针织有限公司｜帽子全品类源头供应链工厂" },
  "category.html": { slug: "/category", title: "帽子8大分类批发｜洛阳兴琪针织有限公司" },
  "supply-chain.html": { slug: "/supply-chain", title: "帽子供应链与48小时发货能力｜洛阳兴琪针织" },
  "oem.html": { slug: "/oem", title: "帽子OEM/ODM与LOGO定制｜洛阳兴琪针织" },
  "faq.html": { slug: "/faq", title: "帽子批发与定制FAQ｜洛阳兴琪针织" }
};

for (const file of files) {
  const html = await fs.readFile(path.join(root, file), "utf8");
  const payload = {
    slug: pages[file].slug,
    title: pages[file].title,
    html,
    status: "published"
  };

  const response = await fetch(`${CMS_API_URL.replace(/\/$/, "")}/pages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CMS_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`发布失败 ${file}: ${response.status} ${text}`);
  }

  console.log(`published ${payload.slug}`);
}
