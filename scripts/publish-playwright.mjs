import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const CMS_URL = process.env.CMS_URL;
const CMS_USER = process.env.CMS_USER;
const CMS_PASS = process.env.CMS_PASS;

if (!CMS_URL || !CMS_USER || !CMS_PASS) {
  throw new Error("请先设置 CMS_URL、CMS_USER、CMS_PASS 环境变量。");
}

const pageFiles = [
  { file: "index.html", slug: "/", title: "洛阳兴琪针织有限公司｜帽子全品类源头供应链工厂" },
  { file: "category.html", slug: "category", title: "帽子8大分类批发｜洛阳兴琪针织有限公司" },
  { file: "supply-chain.html", slug: "supply-chain", title: "帽子供应链与48小时发货能力｜洛阳兴琪针织" },
  { file: "oem.html", slug: "oem", title: "帽子OEM/ODM与LOGO定制｜洛阳兴琪针织" },
  { file: "faq.html", slug: "faq", title: "帽子批发与定制FAQ｜洛阳兴琪针织" }
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${CMS_URL.replace(/\/$/, "")}/login`, { waitUntil: "domcontentloaded" });
await page.fill('input[name="username"], input[type="email"]', CMS_USER);
await page.fill('input[name="password"], input[type="password"]', CMS_PASS);
await page.click('button[type="submit"], input[type="submit"]');
await page.waitForLoadState("networkidle");

for (const item of pageFiles) {
  const html = await fs.readFile(path.resolve("site", item.file), "utf8");

  await page.goto(`${CMS_URL.replace(/\/$/, "")}/admin/pages/new`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="title"]', item.title);
  await page.fill('input[name="slug"]', item.slug);

  const htmlField = page.locator('textarea[name="html"], textarea[name="content"], [contenteditable="true"]').first();
  await htmlField.fill(html);

  const save = page.locator('button:has-text("保存"), button:has-text("Save"), button[data-action="save"]').first();
  await save.click();
  await page.waitForLoadState("networkidle");

  const publish = page.locator('button:has-text("发布"), button:has-text("Publish"), button[data-action="publish"]').first();
  if (await publish.count()) {
    await publish.click();
    await page.waitForLoadState("networkidle");
  }

  console.log(`published ${item.slug}`);
}

await browser.close();
