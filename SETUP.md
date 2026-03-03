# 环境配置说明

## 当前状态

✅ **项目已配置为自动适配开发和生产环境**

- **本地开发**: 自动使用内存存储，无需配置环境变量
- **生产部署**: 使用 Vercel KV，需要配置环境变量

## 本地开发 (当前模式)

项目现在运行在 **http://localhost:3000**

**特点:**
- ✅ 所有功能都可以正常使用
- ⚠️  数据存储在内存中，重启服务器后数据会丢失
- ✅ 无需任何配置，开箱即用

**适用场景:**
- 快速测试功能
- 开发新功能
- 调试问题

## 生产部署 (Vercel)

### 步骤 1: 创建 Vercel KV 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目（或创建新项目）
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **KV** (Redis)
6. 输入数据库名称，点击创建
7. 环境变量会自动注入到项目中

### 步骤 2: 部署项目

**方式 1: Git 自动部署**
```bash
git add .
git commit -m "feat: 添加二维码编号管理系统"
git push
```

**方式 2: Vercel CLI**
```bash
vercel --prod
```

### 步骤 3: 验证部署

访问你的 Vercel 项目 URL，测试功能：
1. 生成二维码 → 应该显示编号
2. 查看"我的二维码" → 应该显示列表
3. 客户填写表单 → 应该能提交成功

## 本地使用 Vercel KV (可选)

如果你想在本地开发时也使用真实的 Vercel KV：

### 方式 1: 使用 Vercel CLI (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 链接到你的 Vercel 项目
vercel link

# 拉取环境变量
vercel env pull .env.local
```

### 方式 2: 手动配置

1. 在 Vercel Dashboard 中找到你的 KV 数据库
2. 复制 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`
3. 创建 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

4. 编辑 `.env.local`，填入你的凭证：

```env
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-token-here
```

5. 重启开发服务器：

```bash
npm run dev
```

## 环境检测

项目会自动检测环境变量：

- **有环境变量**: 使用 Vercel KV (生产模式)
  - 控制台显示: `✅ 使用 Vercel KV (生产模式)`

- **无环境变量**: 使用内存存储 (开发模式)
  - 控制台显示: `⚠️  使用本地内存存储 (开发模式) - 数据不会持久化`

## 数据持久化

### 本地开发模式
- 数据存储在内存中
- 重启服务器后数据丢失
- 适合开发和测试

### 生产模式 (Vercel KV)
- 数据永久保存在 Redis
- 支持高并发访问
- 全球低延迟

## 常见问题

**Q: 本地开发时数据丢失了？**
A: 这是正常的，本地模式使用内存存储。如需持久化，请配置 Vercel KV。

**Q: 如何清空测试数据？**
A: 本地模式：重启服务器即可。生产模式：在 Vercel Dashboard 中管理 KV 数据。

**Q: 可以在本地使用生产数据库吗？**
A: 可以，但不推荐。建议为开发环境创建单独的 KV 数据库。

## 下一步

1. ✅ 本地测试所有功能
2. ✅ 确认功能正常
3. 📦 部署到 Vercel
4. 🎉 开始使用！
