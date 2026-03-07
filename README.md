# QR码编号管理系统

基于 Next.js 14 的二维码送药表单系统,支持编号管理、状态跟踪和业务员仪表板。

## 功能特性

1. **二维码编号**: 每个二维码自动分配 NO.XX 编号,方便查找
2. **简化客户流程**: 客户填写后直接提交,无需生成返回二维码
3. **业务员仪表板**:
   - 查看所有二维码列表（含编号、填写状态、客户信息预览）
   - 按编号搜索，点击「下载二维码」可再次下载带编号的二维码图片
   - 点击编号查看详细内容与客户填写信息
   - 一键复制格式化文本到收款系统
   - 显示字段层级结构

## 技术栈

- Next.js 14.2.18
- React 18
- TypeScript
- Tailwind CSS
- Neon PostgreSQL (Vercel 推荐)

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`:

```bash
cp .env.local.example .env.local
```

然后填入 Neon PostgreSQL 的环境变量,或使用 Vercel CLI 自动拉取:

```bash
vercel env pull .env.local
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 1. 创建 Neon PostgreSQL 数据库

**方式 A: 通过 Vercel Dashboard（推荐）**

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Storage" 标签
4. 点击 "Create Database"
5. 选择 "Postgres" (由 Neon 提供)
6. 创建数据库

环境变量 `DATABASE_URL` 会自动注入到项目中。

**方式 B: 直接使用 Neon**

1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目和数据库
3. 复制连接字符串
4. 在 Vercel 项目设置中添加 `DATABASE_URL` 环境变量

### 2. 初始化数据库表

首次部署后，访问以下 URL 初始化数据库表：

```
https://your-domain.vercel.app/api/init-db
```

或者手动在 Vercel Postgres Dashboard 的 Query 标签中执行 `src/lib/db-schema.sql` 文件中的 SQL。

数据库表会自动创建，包括：
- `qr_codes` - 二维码记录表
- `submissions` - 客户提交记录表
- `counters` - 全局计数器表

### 3. 部署项目

使用 Vercel CLI:

```bash
vercel --prod
```

## 使用说明

### 业务员操作流程

1. 访问首页
2. 点击「楼内送药」或「外送送药」生成二维码
3. 二维码上会显示编号（如 NO.05），方便按编号查找
4. 保存或分享二维码给客户
5. 点击「我的二维码」查看所有二维码（列表展示编号、填写状态及客户信息预览）
6. 在列表中查看填写状态，点击「下载二维码」可再次下载带编号的二维码图片
7. 点击编号进入详情，查看客户填写的完整内容
8. 在详情页复制格式化文本到收款系统

### 客户操作流程

1. 扫描业务员提供的二维码
2. 填写表单信息
3. 点击「确认」提交
4. 看到「提交成功」提示即完成

## 数据结构

### PostgreSQL 表设计

```sql
-- 二维码记录表
qr_codes (
  id VARCHAR(255) PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255)
)

-- 客户提交记录表
submissions (
  id VARCHAR(255) PRIMARY KEY,
  qr_code_id VARCHAR(255) UNIQUE NOT NULL,
  qr_number INTEGER NOT NULL,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE
)

-- 全局计数器表
counters (
  name VARCHAR(50) PRIMARY KEY,
  value INTEGER NOT NULL
)
```



## 注意事项

1. Neon PostgreSQL 免费额度: 0.5 GB 存储，无限计算时间
2. 数据永久保存在 PostgreSQL 数据库中
3. 编号使用数据库事务保证原子递增
4. 所有 API 路由已标记为动态,不会被静态生成
5. 首次部署后，访问 `/api/init-db` 初始化数据库表
6. 支持 JSONB 类型存储复杂表单数据，查询性能更好
7. Neon 是 Vercel 官方推荐的 PostgreSQL 提供商