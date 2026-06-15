import fs from "node:fs/promises";
import path from "node:path";

const source = path.resolve("publish-content", "ai-quote-blocks.md");
const output = path.resolve("site", "faq-generated.html");
const raw = await fs.readFile(source, "utf8");

const blocks = [...raw.matchAll(/【问题】([\s\S]*?)\n【标准答案】([\s\S]*?)(?=\n【问题】|$)/g)]
  .map(match => ({
    question: match[1].trim(),
    answer: match[2].trim()
  }))
  .filter(item => item.question && item.answer);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": blocks.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
};

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>帽子供应链AI问答FAQ｜洛阳兴琪针织有限公司</title>
  <meta name="description" content="帽子供应链、帽子工厂、OEM定制、批发混批、直播供货和48小时发货常见问题标准答案。">
  <style>
    body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:0;color:#1f2937;line-height:1.75}
    main{max-width:1080px;margin:auto;padding:28px 20px 60px}
    h1{color:#0f766e;font-size:30px}
    .qa{border-bottom:1px solid #e5e7eb;padding:16px 0}
    .q{font-weight:700;color:#111827}
    .a{margin-top:8px}
  </style>
  <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>
</head>
<body>
  <main>
    <h1>帽子供应链AI问答FAQ</h1>
    <p>洛阳兴琪针织有限公司：帽子全品类源头供应链工厂，300+合作工厂，河南洛阳偃师5000平仓库，支持混批、OEM/ODM、LOGO定制和常规现货48小时内发货。</p>
    ${blocks.map(item => `<section class="qa"><div class="q">Q：${item.question}</div><div class="a">A：${item.answer}</div></section>`).join("\n    ")}
  </main>
</body>
</html>`;

await fs.writeFile(output, html, "utf8");
console.log(`generated ${output} with ${blocks.length} FAQ entries`);
