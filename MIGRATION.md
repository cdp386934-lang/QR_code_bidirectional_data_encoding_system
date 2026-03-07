# 数据库迁移指南：从 Vercel KV 到 Neon PostgreSQL

## 为什么迁移？

- **更稳定**: PostgreSQL 是成熟的关系型数据库，适合长期运行
- **更大容量**: Neon 免费 0.5 GB 存储，无限计算时间
- **更好的查询**: 支持复杂 SQL 查询和 JSONB 类型
- **易于备份**: 标准 SQL 导出，数据迁移方便
- **官方推荐**: Neon 是 Vercel 官方推荐的 PostgreSQL 提供商

## 迁移步骤

### 1. 安装新依赖

```bash
npm install @neondatabase/serverless
```

### 2. 创建 Neon PostgreSQL 数据库

**方式 A: 通过 Vercel Dashboard（推荐）**

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → Storage → Create Database
3. 选择 **Postgres**（由 Neon 提供）
4. 创建完成后，`DATABASE_URL` 环境变量会自动注入

**方式 B: 直接使用 Neon**

1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目
3. 复制连接字符串
4. 在 Vercel 项目设置中添加 `DATABASE_URL` 环境变量

### 3. 本地开发配置

拉取环境变量到本地：

```bash
vercel env pull .env.local
```

或手动在 `.env.local` 中配置：

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

### 4. 初始化数据库表

部署后访问：

```
https://your-domain.vercel.app/api/init-db
```

或在 Vercel Postgres Dashboard 的 Query 标签中执行 `src/lib/db-schema.sql`

或在 Neon Console 的 SQL Editor 中执行 SQL 脚本

### 5. 数据迁移（如果有旧数据）

如果你之前使用 Vercel KV 并有数据需要迁移：

1. 导出 KV 数据（通过 API 读取所有记录）
2. 转换为 SQL INSERT 语句
3. 在 Postgres 中执行

**注意**: 本项目已完成代码迁移，无需手动修改代码。

### 6. 测试

1. 创建新二维码
2. 填写表单提交
3. 查看二维码列表
4. 验证所有功能正常

## 数据结构对比

### 旧方案 (Vercel KV - Redis)
```
qr:counter                  # 计数器
qr:record:{id}              # JSON 字符串
qr:list                     # Sorted Set
qr:number:{number}          # 映射
submission:{qrCodeId}       # JSON 字符串
```

### 新方案 (Neon PostgreSQL)
```sql
qr_codes                    # 表，带索引
submissions                 # 表，带外键
counters                    # 计数器表
```

## 优势

✅ 关系型数据库，数据完整性更好
✅ 支持事务和外键约束
✅ JSONB 类型存储灵活数据
✅ 标准 SQL 查询，功能更强大
✅ 易于备份和恢复
✅ Neon 免费额度：0.5 GB 存储，无限计算时间
✅ Vercel 官方推荐，深度集成
✅ 自动扩展，无需运维

## 回滚方案

如需回滚到 KV：

1. 恢复 `package.json` 中的 `@vercel/kv` 依赖
2. 从 git 历史恢复 `src/lib/kv.ts` 和 `src/lib/kv-local.ts` 文件
3. 将所有 `@/lib/db` 改回 `@/lib/kv`
4. 重新配置 KV 环境变量
5. 删除 PostgreSQL 相关文件

**注意**: 旧的 KV 文件已从项目中删除，如需回滚请从 git 历史中恢复。
