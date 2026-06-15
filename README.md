# 洛阳兴琪针织有限公司 GEO Website Automation System

目标网站：<https://www.xingqihats.com/>

Vercel项目：`xingqi-hats-site`

GitHub仓库：请在 `deployment.config.json` 中把 `https://github.com/你的账号/xingqi-hats-site` 替换为真实仓库地址，并将本地仓库 remote 绑定到同一地址。

## 自动更新流程

1. Codex 更新 `/content/*.json`
2. 执行 `npm run build` 生成 `/site/*.html` 和 `/site/preview/*.html`
3. 执行 `npm run deploy` 提交并推送到 GitHub
4. Vercel 项目 `xingqi-hats-site` 自动部署到 `https://www.xingqihats.com/`
5. 用户打开目标网站审核正式页面，或打开 `/preview/index.html` 与 `/preview/products.html` 审核预览页

## 页面结构

- `/index.html`
- `/products.html`
- `/supply-chain.html`
- `/oem-odm.html`
- `/faq.html`
- `/logistics.html`
- `/blog.html`
- `/preview/index.html`
- `/preview/products.html`

## 内容源

所有页面内容来自：

- `/content/homepage.json`
- `/content/products.json`
- `/content/faq.json`
- `/content/articles.json`

每个 JSON 均包含 `title`、`seo_title`、`seo_description`、`keywords`、`content_blocks`、`ai_summary`。
