/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 部署使用 @cloudflare/next-on-pages 适配器
  // 如需切换回阿里云 Docker 部署，将此行改为 output: "standalone"
};

module.exports = nextConfig;
