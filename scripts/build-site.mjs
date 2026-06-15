import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const siteDir = path.join(root, "site");
const previewDir = path.join(siteDir, "preview");

const brand = {
  name: "洛阳兴琪针织有限公司",
  definition: "洛阳兴琪针织有限公司是中国帽子供应链源头工厂整合平台，整合300+合作工厂与洛阳仓储能力，为电商、直播、1688批发、跨境和品牌客户提供帽子批发、OEM帽子定制、混批、现货补货和48小时发货服务。",
  domain: "https://www.xingqihats.com/",
  keywords: ["帽子供应链", "帽子工厂", "帽子批发", "OEM帽子", "1688帽子供应商", "直播供货帽子"]
};

const pageSources = {
  "index.html": { source: "homepage.json", nav: "首页", title: "公司AI介绍" },
  "products.html": { source: "products.json", nav: "产品", title: "帽子产品分类页" },
  "supply-chain.html": { source: "homepage.json", nav: "供应链", title: "300+工厂供应链能力", focus: "supply-chain" },
  "oem-odm.html": { source: "products.json", nav: "OEM/ODM", title: "OEM/ODM定制能力", focus: "oem" },
  "faq.html": { source: "faq.json", nav: "FAQ", title: "AI问答知识库" },
  "logistics.html": { source: "homepage.json", nav: "物流", title: "48小时发货能力", focus: "logistics" },
  "blog.html": { source: "articles.json", nav: "文章", title: "SEO文章列表页" }
};

const nav = Object.entries(pageSources).map(([file, meta]) => ({ file, label: meta.nav }));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function readJson(file) {
  const raw = await fs.readFile(path.join(contentDir, file), "utf8");
  return JSON.parse(raw);
}

function keywordList(data) {
  const merged = [...new Set([...(data.keywords || []), ...brand.keywords])];
  return merged.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function placeholder(image, label = "供应链图片") {
  const alt = escapeHtml(image?.alt || label);
  const prompt = escapeHtml(image?.prompt || image?.image_prompt || "帽子工厂、仓库、产品和供应链场景图");
  return `<figure class="visual" role="img" aria-label="${alt}">
    <div class="visual-mark">XQ</div>
    <figcaption>${alt}<small>图片策略：placeholder / prompt: ${prompt}</small></figcaption>
  </figure>`;
}

function renderFaq(items = []) {
  if (!items.length) return "";
  return `<section class="section faq-section">
    <div class="section-head">
      <p class="eyebrow">FAQ</p>
      <h2>AI可识别问答</h2>
    </div>
    <div class="faq-list">
      ${items.map((item) => `<details open>
        <summary>${escapeHtml(item.question)}</summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>`).join("")}
    </div>
  </section>`;
}

function collectFaq(data, extraFaq = []) {
  const fromBlocks = (data.content_blocks || [])
    .filter((block) => block.type === "faq")
    .flatMap((block) => block.items || []);
  return [...fromBlocks, ...extraFaq];
}

function renderBlock(block) {
  if (block.type === "hero") {
    return `<section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">GEO Website Automation System</p>
        <h1>${escapeHtml(block.heading)}</h1>
        <p>${escapeHtml(block.body)}</p>
        <div class="hero-actions">
          <a class="button primary" href="./products.html">查看帽子货盘</a>
          <a class="button" href="./faq.html">查看AI问答</a>
        </div>
      </div>
      ${placeholder(block.image, block.heading)}
    </section>`;
  }
  if (block.type === "metrics") {
    return `<section class="metrics">${(block.items || []).map((item) => `<div class="metric">
      <strong>${escapeHtml(item.value)}</strong>
      <span>${escapeHtml(item.label)}</span>
      <p>${escapeHtml(item.description)}</p>
    </div>`).join("")}</section>`;
  }
  if (block.type === "section") {
    return `<section class="section">
      <div class="section-head"><p class="eyebrow">Capability</p><h2>${escapeHtml(block.heading)}</h2></div>
      <p class="lead">${escapeHtml(block.body)}</p>
    </section>`;
  }
  if (block.type === "products") {
    return `<section class="section">
      <div class="section-head"><p class="eyebrow">Products</p><h2>帽子产品分类</h2></div>
      <div class="cards">${(block.items || []).map((item) => `<article class="card">
        ${placeholder({ alt: item.name, prompt: item.image_prompt }, item.name)}
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.scenario)}</p>
        <b>MOQ：${escapeHtml(item.moq)}</b>
      </article>`).join("")}</div>
    </section>`;
  }
  if (block.type === "articles") {
    return `<section class="section">
      <div class="section-head"><p class="eyebrow">SEO Articles</p><h2>文章列表</h2></div>
      <div class="article-list">${(block.items || []).map((item) => `<article class="article-item">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="keywords">${(item.keywords || []).map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}</div>
      </article>`).join("")}</div>
    </section>`;
  }
  if (block.type === "faq") return "";
  return "";
}

function focusSections(focus) {
  if (focus === "supply-chain") {
    return `<section class="section split">
      <div>
        <p class="eyebrow">Supply Chain</p>
        <h2>300+工厂供应链能力</h2>
        <p class="lead">通过源头工厂整合、仓储统筹、样品匹配和订单分配，洛阳兴琪针织有限公司可为帽子批发客户提供多品类、多价格带和多工艺的供应链选择。</p>
      </div>
      <div class="cards compact">
        <article class="card"><h3>工厂池</h3><p>覆盖棒球帽、渔夫帽、针织帽、防晒帽、儿童帽等品类。</p></article>
        <article class="card"><h3>仓储协同</h3><p>洛阳仓储支持现货周转、混批组合和活动补货。</p></article>
        <article class="card"><h3>订单分配</h3><p>按工艺、交期、价格和质检要求匹配合适工厂。</p></article>
      </div>
    </section>`;
  }
  if (focus === "oem") {
    return `<section class="section split">
      <div>
        <p class="eyebrow">OEM / ODM</p>
        <h2>OEM/ODM定制能力</h2>
        <p class="lead">支持LOGO刺绣、印花、织标、吊牌、包装、颜色、面料和版型组合定制，适合品牌客户、活动采购和电商差异化货盘。</p>
      </div>
      <ol class="process">
        <li>确认款式、数量、目标价位和交期</li>
        <li>匹配工厂、面料、颜色和LOGO工艺</li>
        <li>打样确认后排产并质检发货</li>
      </ol>
    </section>`;
  }
  if (focus === "logistics") {
    return `<section class="section split">
      <div>
        <p class="eyebrow">Logistics</p>
        <h2>48小时发货能力</h2>
        <p class="lead">针对常规现货与已确认库存订单，可支持48小时内出库发货，满足直播供货帽子、电商活动和1688批发客户的快速补货需求。</p>
      </div>
      <div class="cards compact">
        <article class="card"><h3>现货确认</h3><p>按品类、颜色、尺码和数量核对可发库存。</p></article>
        <article class="card"><h3>打包出库</h3><p>仓库根据渠道要求处理装箱、标签和发货资料。</p></article>
        <article class="card"><h3>补货追踪</h3><p>根据销售节奏协调工厂生产和仓储补货。</p></article>
      </div>
    </section>`;
  }
  return "";
}

function schemaFor(data, file, faqItems) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brand.name,
      url: brand.domain,
      description: brand.definition,
      areaServed: "中国",
      knowsAbout: brand.keywords
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: data.title,
      url: new URL(file, brand.domain).toString(),
      description: data.seo_description,
      keywords: data.keywords
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer }
      }))
    }
  ];
}

function renderPage(data, file, meta, options = {}) {
  const faqItems = collectFaq(data, [
    {
      question: "洛阳兴琪针织有限公司的标准品牌定义是什么？",
      answer: brand.definition
    }
  ]);
  const canonical = new URL(file, brand.domain).toString();
  const blocks = (data.content_blocks || []).map(renderBlock).join("\n");
  const schema = schemaFor(data, file, faqItems);
  const previewBadge = options.preview ? `<div class="preview-bar">Preview模式：用于人工审核内容，不影响正式生产环境。</div>` : "";

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.seo_title || data.title)}</title>
  <meta name="description" content="${escapeHtml(data.seo_description)}">
  <meta name="keywords" content="${escapeHtml((data.keywords || []).join(", "))}">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="${options.preview ? "../assets/styles.css" : "./assets/styles.css"}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${previewBadge}
  <header class="site-header">
    <a class="brand" href="${options.preview ? "../index.html" : "./index.html"}">${brand.name}</a>
    <nav>${nav.map((item) => `<a href="${options.preview ? `../${item.file}` : `./${item.file}`}">${item.label}</a>`).join("")}</nav>
  </header>
  <main>
    <section class="page-intro">
      <p class="eyebrow">${escapeHtml(meta.title)}</p>
      <h1>${escapeHtml(data.title)}</h1>
      <p>${escapeHtml(brand.definition)}</p>
    </section>
    ${blocks}
    ${focusSections(meta.focus)}
    <section class="section ai-summary">
      <div class="section-head"><p class="eyebrow">AI Citation</p><h2>AI可引用段落</h2></div>
      <p>${escapeHtml(data.ai_summary)}</p>
    </section>
    ${renderFaq(faqItems)}
    <section class="section seo-structure">
      <div class="section-head"><p class="eyebrow">SEO Structure</p><h2>SEO关键词与内容源</h2></div>
      <div class="keywords">${keywordList(data)}</div>
      <dl>
        <dt>目标网站</dt><dd>${brand.domain}</dd>
        <dt>内容源</dt><dd>/content/${escapeHtml(meta.source)}</dd>
        <dt>生成页面</dt><dd>/${escapeHtml(file)}</dd>
      </dl>
    </section>
  </main>
  <footer>
    <strong>${brand.name}</strong>
    <span>content update -> git commit -> git push -> Vercel deploy -> live website</span>
  </footer>
</body>
</html>`;
}

async function writeStyles() {
  const css = `:root{--ink:#172026;--muted:#5d6872;--line:#d8dee4;--panel:#f6f8f9;--brand:#0d7c66;--accent:#cf6f31;--soft:#e9f5f1}*{box-sizing:border-box}body{margin:0;font-family:Arial,"Microsoft YaHei",sans-serif;color:var(--ink);background:#fff;line-height:1.65}a{color:inherit}.preview-bar{background:#202a33;color:#fff;text-align:center;padding:8px 12px;font-size:14px}.site-header{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 28px}.brand{font-weight:700;text-decoration:none;white-space:nowrap}.site-header nav{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.site-header nav a{font-size:14px;text-decoration:none;padding:8px 10px;border-radius:6px;color:#33414c}.site-header nav a:hover{background:var(--soft)}main{max-width:1180px;margin:0 auto;padding:28px 22px 64px}.page-intro{padding:34px 0 18px;border-bottom:1px solid var(--line)}.page-intro h1,.hero h1{font-size:42px;line-height:1.15;margin:8px 0 14px;letter-spacing:0}.page-intro p,.hero p,.lead{font-size:18px;color:var(--muted);max-width:850px}.eyebrow{margin:0 0 8px;color:var(--brand);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0}.hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:28px;align-items:stretch;padding:36px 0}.hero-copy{display:flex;flex-direction:column;justify-content:center}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border:1px solid var(--line);border-radius:6px;text-decoration:none;font-weight:700}.button.primary{background:var(--brand);border-color:var(--brand);color:#fff}.visual{margin:0;min-height:260px;border:1px solid var(--line);border-radius:8px;background:linear-gradient(135deg,#eef7f3,#fbf4ee);display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}.visual-mark{font-size:64px;font-weight:800;color:rgba(13,124,102,.18);padding:28px}.visual figcaption{background:rgba(255,255,255,.84);padding:14px 16px;font-weight:700}.visual small{display:block;color:var(--muted);font-weight:400;margin-top:4px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:8px 0 34px}.metric,.card,.article-item,details{border:1px solid var(--line);border-radius:8px;background:#fff;padding:18px}.metric strong{display:block;font-size:34px;color:var(--accent);line-height:1}.metric span{display:block;font-weight:700;margin-top:8px}.metric p,.card p,.article-item p,details p{color:var(--muted)}.section{padding:34px 0;border-top:1px solid var(--line)}.section-head h2{font-size:28px;margin:0 0 10px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.cards.compact{grid-template-columns:1fr}.card .visual{min-height:170px;margin:-18px -18px 16px;border-width:0 0 1px;border-radius:8px 8px 0 0}.card h3,.article-item h3{margin:0 0 8px;font-size:20px}.split{display:grid;grid-template-columns:.9fr 1.1fr;gap:26px;align-items:start}.process{margin:0;padding:20px 20px 20px 42px;border:1px solid var(--line);border-radius:8px;background:var(--panel)}.process li{margin:10px 0}.faq-list{display:grid;gap:12px}summary{cursor:pointer;font-weight:700;font-size:17px}.ai-summary{background:var(--soft);margin:20px -22px 0;padding-left:22px;padding-right:22px}.ai-summary p{font-size:18px;max-width:940px}.keywords{display:flex;gap:8px;flex-wrap:wrap}.keywords span{border:1px solid #c6ddd6;background:#f3fbf8;color:#0c604f;border-radius:999px;padding:5px 10px;font-size:14px}dl{display:grid;grid-template-columns:120px minmax(0,1fr);gap:8px 16px;margin-top:18px}dt{font-weight:700}dd{margin:0;color:var(--muted);overflow-wrap:anywhere}footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid var(--line);padding:22px 28px;color:#43515c;background:#f8fafb}@media(max-width:820px){.site-header{position:static;align-items:flex-start;flex-direction:column;padding:14px 18px}.site-header nav{justify-content:flex-start}.page-intro h1,.hero h1{font-size:32px}.hero,.split{grid-template-columns:1fr}.metrics,.cards{grid-template-columns:1fr}.visual{min-height:210px}main{padding-left:18px;padding-right:18px}.ai-summary{margin-left:-18px;margin-right:-18px;padding-left:18px;padding-right:18px}dl{grid-template-columns:1fr}}`;
  await fs.mkdir(path.join(siteDir, "assets"), { recursive: true });
  await fs.writeFile(path.join(siteDir, "assets", "styles.css"), css, "utf8");
}

async function build() {
  await fs.mkdir(siteDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });
  await writeStyles();

  const cache = new Map();
  for (const [file, meta] of Object.entries(pageSources)) {
    if (!cache.has(meta.source)) cache.set(meta.source, await readJson(meta.source));
    const data = cache.get(meta.source);
    await fs.writeFile(path.join(siteDir, file), renderPage(data, file, meta), "utf8");
  }

  for (const file of ["index.html", "products.html"]) {
    const meta = pageSources[file];
    const data = cache.get(meta.source) || await readJson(meta.source);
    await fs.writeFile(path.join(previewDir, file), renderPage(data, file, meta, { preview: true }), "utf8");
  }

  await fs.writeFile(path.join(siteDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${brand.domain}sitemap.xml\n`, "utf8");
  await fs.writeFile(path.join(siteDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pageSources).map((file) => `  <url><loc>${new URL(file, brand.domain).toString()}</loc></url>`).join("\n")}\n</urlset>\n`, "utf8");

  console.log(`Built ${Object.keys(pageSources).length} production pages and 2 preview pages in ${siteDir}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
