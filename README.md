# QR码编号管理系统

基于 Next.js 14 的二维码送药表单系统,支持编号管理、状态跟踪和业务员仪表板。

## 功能特性

1. **二维码编号**: 每个二维码自动分配 NO.XX 编号,方便查找
2. **简化客户流程**: 客户填写后直接提交,无需生成返回二维码
3. **业务员仪表板**:
   - 查看所有二维码列表
   - 按编号搜索
   - 查看填写状态和详细内容
   - 一键复制格式化文本
   - 显示字段层级结构

## 技术栈

- Next.js 14.2.18
- React 18
- TypeScript
- Tailwind CSS
- Vercel KV (Redis)

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

然后填入 Vercel KV 的环境变量,或使用 Vercel CLI 自动拉取:

```bash
vercel env pull .env.local
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 1. 创建 Vercel KV 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Storage" 标签
4. 点击 "Create Database"
5. 选择 "KV" (Redis)
6. 创建数据库

环境变量会自动注入到项目中。

### 2. 部署项目

```bash
git add .
git commit -m "feat: 添加二维码编号管理系统"
git push
```

Vercel 会自动检测并部署。

或使用 Vercel CLI:

```bash
vercel --prod
```

## 使用说明

### 业务员操作流程

1. 访问首页
2. 点击"楼内送药"或"外送送药"生成二维码
3. 二维码上会显示编号 (如 NO.05)
4. 保存或分享二维码给客户
5. 点击"我的二维码"查看所有二维码
6. 在列表中查看填写状态
7. 点击编号查看详细内容
8. 复制格式化文本到收款系统

### 客户操作流程

1. 扫描业务员提供的二维码
2. 填写表单信息
3. 点击"确认"提交
4. 看到"提交成功"提示即完成

## 数据结构

### Redis 键设计

```
qr:counter                  # 全局计数器
qr:record:{id}              # 二维码记录
qr:list                     # 二维码列表 (Sorted Set)
qr:number:{number}          # 编号到ID的映射
submission:{qrCodeId}       # 提交记录
```

## 向后兼容

系统保留了旧的 `/decode` 和 `/result` 页面,旧的二维码仍可正常使用。

## 注意事项

1. Vercel KV 免费额度: 30,000 commands/月
2. 数据永久保存,需定期清理旧数据
3. 编号使用 Redis INCR 保证原子递增
4. 所有 API 路由已标记为动态,不会被静态生成