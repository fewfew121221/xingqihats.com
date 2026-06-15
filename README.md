# 洛阳兴琪针织有限公司 GEO Website Automation System

目标网站：<https://www.xingqihats.com/>

GitHub 仓库：<https://github.com/xingqi-hats/xingqi-hats-site.git>

Vercel 项目：`xingqi-hats-site`

## 一键发布

优化内容写入 `/content/*.json` 或网站代码后执行：

```powershell
npm.cmd run ship
```

该命令会执行：

1. `npm run build`
2. `git add .`
3. `git commit -m "auto deploy update"`
4. `git branch -M main`
5. `git remote remove origin` 与重新绑定
6. `git push -u origin main --force`，最多重试 3 次
7. 如果配置了阿里云环境变量，则通过 SSH 登录服务器重新拉取代码并编译

## 阿里云服务器重编译

脚本不会要求交互式输入密码。请提前配置 SSH key，并设置：

```powershell
$env:ALIYUN_HOST="服务器公网IP或域名"
$env:ALIYUN_USER="root或部署用户"
$env:ALIYUN_APP_DIR="/www/wwwroot/xingqi-hats-site"
$env:ALIYUN_KEY="C:\path\to\id_rsa"
$env:ALIYUN_RESTART_CMD="systemctl reload nginx"
```

单独重编译服务器：

```powershell
npm.cmd run deploy:aliyun
```

## 本地预览

```powershell
npm.cmd run build
npm.cmd run serve
```

打开：<http://127.0.0.1:4173/>

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

- `/content/homepage.json`
- `/content/products.json`
- `/content/faq.json`
- `/content/articles.json`

每个 JSON 均包含 `title`、`seo_title`、`seo_description`、`keywords`、`content_blocks`、`ai_summary`。
