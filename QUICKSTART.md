# 快速开始指南

## 首次部署后的配置步骤

### 1. 创建 Neon PostgreSQL 数据库

**方式 A: 通过 Vercel Dashboard（推荐）**
1. 进入项目
2. Storage 标签
3. Create Database → 选择 Postgres (由 Neon 提供)
4. 等待创建完成（`DATABASE_URL` 环境变量会自动注入）

**方式 B: 直接使用 Neon**
1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目和数据库
3. 复制连接字符串
4. 在 Vercel 项目设置中添加 `DATABASE_URL` 环境变量

### 2. 初始化数据库

访问你的部署 URL：

```
https://your-app.vercel.app/api/init-db
```

看到成功消息：
```json
{
  "success": true,
  "message": "数据库表初始化成功"
}
```

### 3. 测试功能

1. 访问首页
2. 点击「楼内送药」或「外送送药」
3. 生成二维码（会显示编号 NO.01）
4. 扫描二维码填写表单
5. 查看「我的二维码」列表

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 拉取环境变量
vercel env pull .env.local

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:3000/api/init-db 初始化本地数据库
```

### 环境变量说明

Neon PostgreSQL 主要使用一个环境变量：

- `DATABASE_URL` - PostgreSQL 连接字符串（必需）

格式：`postgresql://user:password@host.neon.tech/dbname?sslmode=require`

如果通过 Vercel 创建，还可能包含：
- `POSTGRES_URL` - 备用连接字符串

### 常见问题

**Q: 数据库初始化失败？**
A: 检查 Neon PostgreSQL 是否已创建并且 `DATABASE_URL` 环境变量已配置

**Q: 如何查看数据库内容？**
A:
- Vercel 方式：在 Vercel Dashboard → Storage → Postgres → Query 标签
- Neon 方式：在 Neon Console → SQL Editor

**Q: 如何备份数据？**
A: 在 Query 标签中执行：
```sql
SELECT * FROM qr_codes;
SELECT * FROM submissions;
```
导出为 CSV 或 JSON

### 数据库管理

查看所有二维码：
```sql
SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 10;
```

查看提交记录：
```sql
SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 10;
```

查看当前计数器：
```sql
SELECT * FROM counters;
```

重置计数器（谨慎使用）：
```sql
UPDATE counters SET value = 0 WHERE name = 'qr_number';
```
