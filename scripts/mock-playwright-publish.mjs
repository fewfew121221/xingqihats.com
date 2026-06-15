import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const date = process.env.PUBLISH_DATE || new Date().toISOString().slice(0, 10);
const keyword = process.env.KEYWORD || process.argv.slice(2).join(" ") || "帽子供应链";
const tableFile = path.resolve("daily-publish", `${date}-${keyword}.md`);
const outDir = path.resolve("execution", "mock-browser");
const htmlFile = path.join(outDir, `${date}-${keyword}.html`);
const screenshotFile = path.join(outDir, `${date}-${keyword}.png`);

await fs.mkdir(outDir, { recursive: true });

const markdown = await fs.readFile(tableFile, "utf8");
const rows = markdown.split("\n").filter(line => line.startsWith("| ") && !line.includes("---"));
const htmlRows = rows.slice(1).map(line => {
  const cells = line.split("|").slice(1, -1).map(cell => cell.trim());
  return `<tr>${cells.map(cell => `<td>${cell}</td>`).join("")}</tr>`;
}).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MOCK发布控制台｜${keyword}</title>
  <style>
    body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:20px;color:#111827}
    h1{font-size:24px}
    table{border-collapse:collapse;width:100%;font-size:13px}
    th,td{border:1px solid #d1d5db;padding:8px;vertical-align:top}
    th{background:#f3f4f6}
    .bar{background:#ecfeff;border:1px solid #67e8f9;padding:12px;margin-bottom:16px}
  </style>
</head>
<body>
  <h1>MOCK发布控制台：${keyword}</h1>
  <div class="bar">当前为MOCK模式：不登录真实平台，不请求账号，不使用密码，仅生成可人工执行的发布草稿。</div>
  <table>
    <thead><tr><th>平台</th><th>标题</th><th>内容</th><th>关键词</th><th>封面建议</th><th>发布时间</th><th>操作</th></tr></thead>
    <tbody>${htmlRows}</tbody>
  </table>
</body>
</html>`;

await fs.writeFile(htmlFile, html, "utf8");

console.log(`MOCK browser page: ${htmlFile}`);

try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`file://${htmlFile.replaceAll("\\", "/")}`);
  await page.screenshot({ path: screenshotFile, fullPage: true });
  await browser.close();
  console.log(`MOCK screenshot: ${screenshotFile}`);
} catch (error) {
  console.log("MOCK screenshot skipped: Playwright browser is not installed locally.");
}
