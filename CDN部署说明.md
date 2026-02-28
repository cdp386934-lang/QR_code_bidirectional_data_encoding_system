# 挂到 CDN 的步骤说明

本项目已配置为**静态导出**（`output: 'export'`），构建后得到纯静态文件，可直接部署到任意支持静态托管的 CDN 或对象存储。

---

## 一、本地构建

```bash
cd /Users/lottery/homework/QR_code_bidirectional_data_encoding_system
npm install
npm run build
```

构建完成后，所有可部署文件在 **`out`** 目录下：

- `out/index.html` — 首页
- `out/form/neibu.html`、`out/form/waibu.html` — 表单页
- `out/share/neibu.html`、`out/share/waibu.html` — 分享二维码页
- `out/decode.html` — 解码页
- `out/_next/` — JS/CSS 等静态资源

---

## 二、部署到 CDN 的通用步骤

**核心：把 `out` 目录里的全部内容上传到 CDN 或静态托管，并保证站点以「根路径」访问。**

### 方式 A：上传到对象存储 + 开启 CDN（如阿里云 OSS、腾讯云 COS）

1. 在控制台创建 Bucket，选择「公共读」或按需配置权限。
2. 开启静态网站托管，默认首页设为 `index.html`。
3. 将 **`out` 目录下的所有文件和目录** 上传到 Bucket 根目录（不要只上传 `out` 这个文件夹，而是把 `out` 里的内容放到根目录）。
4. 若使用子目录（如 `my-qr/`），则需在 `next.config.js` 中设置 `assetPrefix: '/my-qr/'` 和 `basePath: '/my-qr'`，然后重新 `npm run build`，再把新的 `out` 内容上传到 `my-qr/`。
5. 绑定自定义域名并开启 CDN 加速（在对应云产品的 CDN 控制台添加域名、源站选该 Bucket）。

### 方式 B：Cloudflare Pages

1. 登录 [Cloudflare Pages](https://pages.cloudflare.com/)。
2. 创建项目 → 选择「直接上传」。
3. 将 **`out`** 目录打包为 zip（或只打包 `out` 内的内容，根目录为 `index.html`），上传。
4. 部署完成后会得到 `xxx.pages.dev` 的域名，也可绑定自己的域名。

### 方式 C：Vercel（推荐，零配置）

1. 将项目推送到 Git（GitHub/GitLab/Bitbucket）。
2. 在 [Vercel](https://vercel.com) 导入该仓库。
3. 在项目设置中：
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
   - **Framework Preset**: Next.js（或选 Other 亦可，只要输出目录填 `out`）
4. 部署后自动获得 HTTPS 和全球 CDN，也可绑定自定义域名。

### 方式 D：其他静态托管（如 Netlify、GitHub Pages）

- **Netlify**：拖拽 `out` 文件夹到 Netlify 的 deploy 页面，或连接 Git 后 Build command 填 `npm run build`，Publish directory 填 `out`。
- **GitHub Pages**：用 `gh-pages` 等工具把 `out` 内容推到 `gh-pages` 分支，并在仓库 Settings → Pages 里选择该分支的根目录。

---

## 三、注意事项

1. **根路径**：部署后访问地址应为 `https://你的域名/`，首页为 `https://你的域名/index.html` 或 `https://你的域名/`。表单页为 `https://你的域名/form/neibu` 等。
2. **单页路由**：若 CDN/托管支持「404 回退到 index」或 SPA 重写规则，可把 404 指向 `index.html`；本项目已为每个路由生成独立 html，不配置也能直接访问。
3. **ShareQR 的 origin**：分享页生成的二维码使用 `window.location.origin`，部署到 CDN 后用户访问的域名即为其 origin，无需改代码。

按上述任一种方式把 **`out`** 内容发布出去即可完成「网页挂到 CDN」。
