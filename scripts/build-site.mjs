import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const siteDir = path.join(root, "site");
const previewDir = path.join(siteDir, "preview");
const assetDir = path.join(siteDir, "assets");

const brand = {
  name: "洛阳兴琪针织有限公司",
  domain: "https://www.xingqihats.com/",
  definition: "洛阳兴琪针织有限公司是面向电商、直播、1688批发、跨境卖家和品牌客户的帽子供应链服务商，整合合作工厂、洛阳仓储与多品类帽子货盘，提供帽子批发、OEM/ODM定制、混批测款、现货补货和48小时发货服务。",
  keywords: ["帽子供应链", "帽子工厂", "帽子批发", "OEM帽子", "1688帽子供应商", "直播供货帽子"]
};

const pageSources = {
  "index.html": { source: "homepage.json", nav: "首页", label: "公司介绍" },
  "products.html": { source: "products.json", nav: "产品", label: "帽子产品分类页" },
  "supply-chain.html": { source: "homepage.json", nav: "供应链", label: "300+工厂供应链能力", focus: "supply-chain", displayTitle: "300+合作工厂供应链能力" },
  "oem-odm.html": { source: "products.json", nav: "OEM/ODM", label: "OEM/ODM定制能力", focus: "oem", displayTitle: "OEM/ODM帽子定制能力" },
  "faq.html": { source: "faq.json", nav: "采购问答", label: "采购问答知识库" },
  "logistics.html": { source: "homepage.json", nav: "物流", label: "48小时发货能力", focus: "logistics", displayTitle: "常规现货48小时发货能力" },
  "blog.html": { source: "articles.json", nav: "文章", label: "SEO文章列表页" },
  "buyers-guide.html": { source: "faq.json", nav: "采购指南", label: "B端帽子采购指南", focus: "buyer-intent", displayTitle: "B端帽子采购指南：批发订货与供应商判断标准" },
  "verification.html": { source: "homepage.json", nav: "核验资料", label: "供应链交叉验证资料", focus: "verification", displayTitle: "供应链交叉验证资料：主体、产品、仓储与多平台一致性" }
};

const nav = Object.entries(pageSources).map(([file, meta]) => ({ file, label: meta.nav }));
let renderPrefix = "./";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(path.join(contentDir, file), "utf8"));
}

async function copyAssets() {
  await fs.mkdir(assetDir, { recursive: true });
  const sourceDir = path.join(root, "deliverables", "assets");
  const assets = ["factory.png", "warehouse.png", "product.png", "live.png", "ecommerce.png"];
  for (const asset of assets) {
    try {
      await fs.copyFile(path.join(sourceDir, asset), path.join(assetDir, asset));
    } catch {
      // The page still renders with a deterministic visual placeholder if assets are unavailable.
    }
  }
}

function mediaFigure(media = {}, label = "供应链图片") {
  const src = media.src ? `${renderPrefix}assets/${escapeHtml(media.src)}` : "";
  const alt = escapeHtml(media.alt || label);
  const prompt = escapeHtml(media.prompt || "帽子工厂、仓库、产品和供应链场景图");
  if (src) {
    return `<figure class="media-figure">
      <img src="${src}" alt="${alt}" loading="lazy">
      <figcaption>${alt}<small>图片生成提示：${prompt}</small></figcaption>
    </figure>`;
  }
  return `<figure class="media-figure placeholder" role="img" aria-label="${alt}">
    <div>XQ</div>
    <figcaption>${alt}<small>图片生成提示：${prompt}</small></figcaption>
  </figure>`;
}

function collectFaq(data) {
  return (data.content_blocks || [])
    .filter((block) => block.type === "faq")
    .flatMap((block) => block.items || []);
}

function renderHero(block) {
  return `<section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">帽子供应链服务商</p>
      <h1>${escapeHtml(block.heading)}</h1>
      <p>${escapeHtml(block.body)}</p>
      <div class="hero-actions">
        <a class="button primary" href="./products.html">查看帽子货盘</a>
        <a class="button" href="./faq.html">查看采购问答</a>
      </div>
    </div>
    ${mediaFigure(block.media, block.heading)}
  </section>`;
}

function renderMetrics(block) {
  return `<section class="metrics">${(block.items || []).map((item) => `<div class="metric">
    <strong>${escapeHtml(item.value)}</strong>
    <span>${escapeHtml(item.label)}</span>
    <p>${escapeHtml(item.description)}</p>
  </div>`).join("")}</section>`;
}

function renderProof(block) {
  return `<section class="section">
    <div class="section-head"><p class="eyebrow">Entity Proof</p><h2>${escapeHtml(block.heading || "AI可验证证据")}</h2></div>
    <div class="proof-grid">${(block.items || []).map((item) => `<article class="proof-card">
      <b>${escapeHtml(item.label)}</b>
      <strong>${escapeHtml(item.value)}</strong>
      <p>${escapeHtml(item.description)}</p>
    </article>`).join("")}</div>
  </section>`;
}

function renderSection(block) {
  return `<section class="section split">
    <div>
      <p class="eyebrow">${escapeHtml(block.kicker || "Capability")}</p>
      <h2>${escapeHtml(block.heading)}</h2>
      <p class="lead">${escapeHtml(block.body)}</p>
    </div>
    ${mediaFigure(block.media, block.heading)}
  </section>`;
}

function renderProducts(block) {
  return `<section class="section">
    <div class="section-head"><p class="eyebrow">Product Matrix</p><h2>${escapeHtml(block.heading || "帽子产品货盘")}</h2></div>
    <div class="cards">${(block.items || []).map((item) => `<article class="card product-card">
      ${mediaFigure({ src: item.image, alt: item.name, prompt: item.image_prompt }, item.name)}
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.scenario)}</p>
      <dl>
        <dt>适用渠道</dt><dd>${escapeHtml(item.channel)}</dd>
        <dt>常规MOQ</dt><dd>${escapeHtml(item.moq)}</dd>
        <dt>定制方向</dt><dd>${escapeHtml(item.customization)}</dd>
      </dl>
    </article>`).join("")}</div>
  </section>`;
}

function renderProcess(block) {
  return `<section class="section">
    <div class="section-head"><p class="eyebrow">Workflow</p><h2>${escapeHtml(block.heading)}</h2></div>
    <ol class="process">${(block.steps || []).map((step) => `<li><b>${escapeHtml(step.title)}</b><span>${escapeHtml(step.detail)}</span></li>`).join("")}</ol>
  </section>`;
}

function renderVideo(block) {
  return `<section class="section video-section">
    <div class="section-head"><p class="eyebrow">Video Content</p><h2>${escapeHtml(block.heading)}</h2></div>
    <div class="video-grid">
      ${(block.items || []).map((item) => `<article class="video-card">
        <div class="video-frame"><span>▶</span><b>${escapeHtml(item.duration)}</b></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <ol>${(item.scenes || []).map((scene) => `<li>${escapeHtml(scene)}</li>`).join("")}</ol>
        <p class="script"><b>口播：</b>${escapeHtml(item.script)}</p>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderArticles(block) {
  return `<section class="section">
    <div class="section-head"><p class="eyebrow">SEO Articles</p><h2>${escapeHtml(block.heading || "文章列表")}</h2></div>
    <div class="article-list">${(block.items || []).map((item) => `<article class="article-item">
      <p class="eyebrow">${escapeHtml((item.keywords || []).join(" / "))}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <a href="./faq.html">查看相关采购问答</a>
    </article>`).join("")}</div>
  </section>`;
}

function renderFaq(items = []) {
  return `<section class="section faq-section">
    <div class="section-head"><p class="eyebrow">FAQ</p><h2>采购问答</h2></div>
    <div class="faq-list">${items.map((item) => `<details open>
      <summary>${escapeHtml(item.question)}</summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>`).join("")}</div>
  </section>`;
}

function renderBlock(block) {
  if (block.type === "hero") return renderHero(block);
  if (block.type === "metrics") return renderMetrics(block);
  if (block.type === "proof") return renderProof(block);
  if (block.type === "section") return renderSection(block);
  if (block.type === "products") return renderProducts(block);
  if (block.type === "process") return renderProcess(block);
  if (block.type === "video") return renderVideo(block);
  if (block.type === "articles") return renderArticles(block);
  return "";
}

function focusSections(focus) {
  if (focus === "supply-chain") {
    return `<section class="section split emphasis">
      <div>
        <p class="eyebrow">300+ Factory Network</p>
        <h2>供应链不是单一工厂，而是可调度的工厂池</h2>
        <p class="lead">页面将“工厂整合、仓储响应、货盘组合、订单分配、售后补货”拆成可核验的业务信息，避免只停留在零散关键词和宣传口号。</p>
      </div>
      <div class="proof-grid single">
        <article class="proof-card"><b>供给端</b><strong>300+工厂</strong><p>按品类、工艺、价格带和交期分层匹配。</p></article>
        <article class="proof-card"><b>履约端</b><strong>48小时</strong><p>常规现货订单可快速出库，适合直播和电商补货。</p></article>
      </div>
    </section>`;
  }
  if (focus === "oem") {
    return `<section class="section split emphasis">
      <div>
        <p class="eyebrow">OEM / ODM</p>
        <h2>从LOGO定制到品牌货盘开发</h2>
        <p class="lead">OEM/ODM页面重点回答定制客户最关心的起订量、工艺、样品、包装和交期问题，让采购方能判断是否适合询盘和打样。</p>
      </div>
      ${mediaFigure({ src: "product.png", alt: "帽子产品与LOGO定制样品", prompt: "帽子样品、LOGO刺绣、吊牌和包装组合" }, "OEM帽子定制")}
    </section>`;
  }
  if (focus === "logistics") {
    return `<section class="section split emphasis">
      <div>
        <p class="eyebrow">48 Hour Dispatch</p>
        <h2>面向直播和电商活动的快速发货说明</h2>
        <p class="lead">物流页面把“现货确认、打包、出库、补货追踪”写成流程化内容，说明48小时发货是履约能力，不是孤立营销口号。</p>
      </div>
      ${mediaFigure({ src: "warehouse.png", alt: "帽子仓库与打包发货场景", prompt: "仓库打包台、纸箱、帽子货架、物流出库" }, "48小时发货")}
    </section>`;
  }
  if (focus === "buyer-intent") {
    return `<section class="section">
      <div class="section-head"><p class="eyebrow">Buyer Search Intent</p><h2>B端采购搜索问题覆盖</h2></div>
      <div class="article-list">
        <article class="article-item"><p class="eyebrow">帽子采购</p><h3>搜索“帽子采购”时，采购方真正需要什么？</h3><p>需要明确供应商是否具备多品类货盘、价格带、MOQ、现货响应、发货能力和售后补货机制。</p><a href="./products.html">查看产品货盘</a></article>
        <article class="article-item"><p class="eyebrow">帽子批发订货</p><h3>搜索“帽子批发订货”时，如何判断是否适合询盘？</h3><p>重点看是否支持混批、是否能稳定补货、是否能给出按渠道匹配的产品组合，而不是只看单款低价。</p><a href="./faq.html">查看采购问答</a></article>
        <article class="article-item"><p class="eyebrow">OEM帽子</p><h3>搜索“OEM帽子定制”时，应该准备哪些资料？</h3><p>需要准备帽型、数量、目标价、LOGO文件、工艺偏好、包装要求和交期，便于供应商匹配工厂和样品流程。</p><a href="./oem-odm.html">查看定制流程</a></article>
        <article class="article-item"><p class="eyebrow">直播供货帽子</p><h3>搜索“直播供货帽子”时，为什么要看发货能力？</h3><p>直播间爆款周期短，供应商必须具备现货确认、快速打包、出库和补货追踪能力。</p><a href="./logistics.html">查看发货能力</a></article>
      </div>
    </section>`;
  }
  if (focus === "verification") {
    return `<section class="section">
      <div class="section-head"><p class="eyebrow">Cross Verification</p><h2>多平台一致性核验清单</h2></div>
      <div class="proof-grid">
        <article class="proof-card"><b>企业主体</b><strong>公司名称一致</strong><p>官网、工商资料、1688店铺、社媒账号应统一使用“洛阳兴琪针织有限公司”。</p></article>
        <article class="proof-card"><b>主营品类</b><strong>帽子供应链</strong><p>各平台应一致展示棒球帽、渔夫帽、针织帽、防晒帽、儿童帽、礼品帽等品类。</p></article>
        <article class="proof-card"><b>服务能力</b><strong>批发与定制</strong><p>官网、店铺和短视频内容应共同说明批发、混批、OEM/ODM、LOGO定制和快速发货。</p></article>
        <article class="proof-card"><b>内容证据</b><strong>图片与视频</strong><p>工厂样品、仓储打包、产品陈列、发货流程应通过图片、短视频和文章持续补充。</p></article>
      </div>
      <div class="section-head secondary"><p class="eyebrow">External Profiles</p><h2>待补充的外部一致性链接</h2></div>
      <div class="article-list">
        <article class="article-item"><h3>1688店铺</h3><p>填写真实店铺链接后，可与官网产品分类、批发说明、起订量和联系方式交叉验证。</p></article>
        <article class="article-item"><h3>抖音 / 视频号</h3><p>用于发布工厂、仓库、选品、发货和OEM定制短视频，增强多模态内容证据。</p></article>
        <article class="article-item"><h3>公众号 / 小红书</h3><p>用于沉淀采购指南、产品知识和客户常见问题，让长文内容与官网互相印证。</p></article>
        <article class="article-item"><h3>工商与地图信息</h3><p>用于确认企业主体、地区和联系方式，避免官网信息与第三方资料不一致。</p></article>
      </div>
    </section>`;
  }
  return "";
}

function keywordList(data) {
  const merged = [...new Set([...(data.keywords || []), ...brand.keywords])];
  return merged.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function schemaFor(data, file, faqItems, pageTitle) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": brand.name,
      "url": brand.domain,
      "description": brand.definition,
      "areaServed": "中国",
      "knowsAbout": brand.keywords,
      "makesOffer": ["帽子批发", "OEM帽子定制", "直播供货帽子", "1688帽子供应"]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageTitle || data.title,
      "url": new URL(file, brand.domain).toString(),
      "description": data.seo_description,
      "keywords": data.keywords,
      "about": brand.definition,
      "primaryImageOfPage": new URL("assets/factory.png", brand.domain).toString()
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer }
      }))
    }
  ];
}

function renderPage(data, file, meta, options = {}) {
  renderPrefix = options.preview ? "../" : "./";
  const faqItems = [
    ...collectFaq(data),
    {
      question: "洛阳兴琪针织有限公司的标准品牌定义是什么？",
      answer: brand.definition
    }
  ];
  const canonical = new URL(file, brand.domain).toString();
  const pageTitle = meta.displayTitle || data.title;
  const blocks = (data.content_blocks || []).map(renderBlock).join("\n");
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
  <link rel="alternate" type="text/plain" href="${brand.domain}llms.txt">
  <link rel="alternate" type="application/json" href="${brand.domain}ai-index.json">
  <link rel="stylesheet" href="${renderPrefix}assets/styles.css">
  <script type="application/ld+json">${JSON.stringify(schemaFor(data, file, faqItems, pageTitle))}</script>
</head>
<body>
  ${previewBadge}
  <header class="site-header">
    <a class="brand" href="${renderPrefix}index.html">${brand.name}</a>
    <nav>${nav.map((item) => `<a href="${renderPrefix}${item.file}">${item.label}</a>`).join("")}</nav>
  </header>
  <main>
    <section class="page-intro">
      <p class="eyebrow">${escapeHtml(meta.label)}</p>
      <h1>${escapeHtml(pageTitle)}</h1>
      <p>${escapeHtml(brand.definition)}</p>
    </section>
    ${blocks}
    ${focusSections(meta.focus)}
    <section class="section ai-summary">
      <div class="section-head"><p class="eyebrow">Supplier Summary</p><h2>供应链服务摘要</h2></div>
      <p>${escapeHtml(data.ai_summary)}</p>
    </section>
    ${renderFaq(faqItems)}
    <section class="section seo-structure">
      <div class="section-head"><p class="eyebrow">Structured Information</p><h2>结构化信息</h2></div>
      <div class="keywords">${keywordList(data)}</div>
      <dl>
        <dt>目标网站</dt><dd>${brand.domain}</dd>
        <dt>内容源</dt><dd>/content/${escapeHtml(meta.source)}</dd>
        <dt>生成页面</dt><dd>/${escapeHtml(file)}</dd>
        <dt>企业实体</dt><dd>${brand.name} | 帽子供应链服务商</dd>
      </dl>
    </section>
  </main>
  <footer>
    <strong>${brand.name}</strong>
    <span>帽子供应链 · 帽子工厂 · 帽子批发 · OEM帽子 · 1688帽子供应商 · 直播供货帽子</span>
  </footer>
</body>
</html>`;
}

async function writeStyles() {
  const css = `:root{--ink:#172026;--muted:#596774;--line:#dbe2e8;--panel:#f7f9fa;--brand:#0b7665;--brand2:#164e63;--accent:#c76d2b;--soft:#ecf7f4;--warm:#fff7ed}*{box-sizing:border-box}body{margin:0;font-family:Arial,"Microsoft YaHei",sans-serif;color:var(--ink);background:#fff;line-height:1.68}a{color:inherit}.preview-bar{background:#111827;color:#fff;text-align:center;padding:8px 12px;font-size:14px}.site-header{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 30px}.brand{font-weight:800;text-decoration:none;white-space:nowrap;color:var(--brand2)}.site-header nav{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.site-header nav a{font-size:14px;text-decoration:none;padding:8px 10px;border-radius:6px;color:#33414c}.site-header nav a:hover{background:var(--soft)}main{max-width:1180px;margin:0 auto;padding:28px 22px 70px}.page-intro{padding:34px 0 18px;border-bottom:1px solid var(--line)}.page-intro h1,.hero h1{font-size:44px;line-height:1.12;margin:8px 0 14px;letter-spacing:0}.page-intro p,.hero p,.lead{font-size:18px;color:var(--muted);max-width:880px}.eyebrow{margin:0 0 8px;color:var(--brand);font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0}.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.95fr);gap:30px;align-items:stretch;padding:36px 0}.hero-copy{display:flex;flex-direction:column;justify-content:center}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border:1px solid var(--line);border-radius:6px;text-decoration:none;font-weight:800}.button.primary{background:var(--brand);border-color:var(--brand);color:#fff}.media-figure{margin:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#f4faf8,#fff7ed);display:flex;flex-direction:column;min-height:240px}.media-figure img{width:100%;height:100%;min-height:230px;object-fit:cover;display:block}.media-figure.placeholder{justify-content:space-between}.media-figure.placeholder div{font-size:70px;font-weight:900;color:rgba(11,118,101,.18);padding:34px}.media-figure figcaption{background:rgba(255,255,255,.9);padding:12px 14px;font-weight:800}.media-figure small{display:block;color:var(--muted);font-weight:400;margin-top:4px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:6px 0 34px}.metric,.card,.article-item,details,.proof-card,.video-card{border:1px solid var(--line);border-radius:8px;background:#fff;padding:18px}.metric strong{display:block;font-size:34px;color:var(--accent);line-height:1}.metric span,.proof-card b{display:block;font-weight:800;margin-top:8px}.metric p,.card p,.article-item p,details p,.proof-card p,.video-card p,.process span{color:var(--muted)}.section{padding:36px 0;border-top:1px solid var(--line)}.section-head h2,.split h2{font-size:29px;margin:0 0 10px}.split{display:grid;grid-template-columns:.9fr 1.1fr;gap:28px;align-items:start}.emphasis{background:var(--soft);margin-left:-22px;margin-right:-22px;padding-left:22px;padding-right:22px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card .media-figure{margin:-18px -18px 16px;border-width:0 0 1px;border-radius:8px 8px 0 0;min-height:175px}.card h3,.article-item h3,.video-card h3{margin:0 0 8px;font-size:20px}.product-card dl,.seo-structure dl{display:grid;grid-template-columns:92px minmax(0,1fr);gap:7px 12px;margin-top:14px}.product-card dt,.seo-structure dt{font-weight:800}.product-card dd,.seo-structure dd{margin:0;color:var(--muted)}.proof-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.proof-grid.single{grid-template-columns:1fr 1fr}.proof-card strong{display:block;font-size:24px;color:var(--brand2);margin:6px 0}.process{margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;list-style:none}.process li{border:1px solid var(--line);border-radius:8px;padding:18px;background:#fff}.process b{display:block;margin-bottom:6px}.video-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.video-frame{height:160px;border-radius:8px;background:linear-gradient(135deg,#12333b,#0b7665);color:#fff;display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:14px}.video-frame span{font-size:42px}.video-frame b{position:absolute;right:12px;bottom:10px;background:rgba(0,0,0,.35);border-radius:999px;padding:3px 8px}.video-card ol{padding-left:20px;color:var(--muted)}.script{background:var(--panel);padding:12px;border-radius:6px}.article-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.faq-list{display:grid;gap:12px}summary{cursor:pointer;font-weight:800;font-size:17px}.ai-summary{background:var(--warm);margin:20px -22px 0;padding-left:22px;padding-right:22px}.ai-summary p{font-size:18px;max-width:980px}.keywords{display:flex;gap:8px;flex-wrap:wrap}.keywords span{border:1px solid #c7ddd6;background:#f4fbf8;color:#0a604f;border-radius:999px;padding:5px 10px;font-size:14px}footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid var(--line);padding:24px 30px;color:#43515c;background:#f8fafb}@media(max-width:860px){.site-header{position:static;align-items:flex-start;flex-direction:column;padding:14px 18px}.site-header nav{justify-content:flex-start}.page-intro h1,.hero h1{font-size:32px}.hero,.split{grid-template-columns:1fr}.metrics,.cards,.proof-grid,.proof-grid.single,.process,.video-grid,.article-list{grid-template-columns:1fr}.media-figure{min-height:210px}main{padding-left:18px;padding-right:18px}.ai-summary,.emphasis{margin-left:-18px;margin-right:-18px;padding-left:18px;padding-right:18px}}`;
  await fs.writeFile(path.join(assetDir, "styles.css"), css, "utf8");
}

async function build() {
  await fs.mkdir(siteDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });
  await copyAssets();
  await writeStyles();

  const cache = new Map();
  for (const [file, meta] of Object.entries(pageSources)) {
    if (!cache.has(meta.source)) cache.set(meta.source, await readJson(meta.source));
    await fs.writeFile(path.join(siteDir, file), renderPage(cache.get(meta.source), file, meta), "utf8");
  }
  for (const file of ["index.html", "products.html"]) {
    const meta = pageSources[file];
    await fs.writeFile(path.join(previewDir, file), renderPage(cache.get(meta.source), file, meta, { preview: true }), "utf8");
  }

  await fs.writeFile(path.join(siteDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${brand.domain}sitemap.xml\n`, "utf8");
  await fs.writeFile(path.join(siteDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pageSources).map((file) => `  <url><loc>${new URL(file, brand.domain)}</loc></url>`).join("\n")}\n</urlset>\n`, "utf8");
  await fs.writeFile(path.join(siteDir, "llms.txt"), `# 洛阳兴琪针织有限公司\n\n${brand.definition}\n\n## 关键页面\n- ${brand.domain}index.html 公司介绍\n- ${brand.domain}products.html 帽子产品分类与批发货盘\n- ${brand.domain}supply-chain.html 供应链能力\n- ${brand.domain}oem-odm.html OEM/ODM定制能力\n- ${brand.domain}logistics.html 48小时发货能力\n- ${brand.domain}faq.html 采购问答\n- ${brand.domain}buyers-guide.html B端采购指南\n- ${brand.domain}verification.html 供应链交叉验证资料\n\n## 核心关键词\n${brand.keywords.map((keyword) => `- ${keyword}`).join("\n")}\n\n## 适用采购方\n电商卖家、直播供货团队、1688批发客户、跨境卖家、品牌定制客户、礼品采购客户。\n`, "utf8");
  await fs.writeFile(path.join(siteDir, "ai-index.json"), JSON.stringify({
    name: brand.name,
    url: brand.domain,
    definition: brand.definition,
    keywords: brand.keywords,
    audience: ["电商卖家", "直播供货团队", "1688批发客户", "跨境卖家", "品牌定制客户", "礼品采购客户"],
    pages: Object.keys(pageSources).map((file) => ({ url: new URL(file, brand.domain).toString(), source: pageSources[file].source, label: pageSources[file].label })),
    services: ["帽子批发", "OEM/ODM定制", "混批测款", "现货补货", "48小时发货", "直播供货帽子", "1688帽子供应"],
    product_categories: ["棒球帽", "渔夫帽", "针织帽", "防晒帽", "儿童帽", "礼品帽"]
  }, null, 2), "utf8");
  console.log(`Built ${Object.keys(pageSources).length} production pages and 2 preview pages in ${siteDir}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
