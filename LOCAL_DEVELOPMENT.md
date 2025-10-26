# 本地开发指南

## 🚀 快速开始

### 1. 环境配置

确保 `.env` 文件包含以下配置：

```env
PAYLOAD_SECRET=153fa73500c0d30559fe447b054752a1fc8368dd00b85939b27ab1b63c365b97
NEXT_PUBLIC_URL=http://localhost:3600

# PostgreSQL 数据库连接（本地开发）
DATABASE_URL=postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev
```

### 2. 生成数据库迁移（首次运行）

```bash
# 创建初始 schema 迁移
pnpm payload migrate:create

# 运行迁移
pnpm payload migrate
```

### 3. 启动开发服务器

```bash
# 清理缓存并启动（推荐）
pnpm devsafe

# 或常规启动
pnpm dev
```

### 4. 访问应用

- **管理面板**: http://localhost:3600/admin
- **API 文档**: http://localhost:3600/api/docs
- **GraphQL Playground**: http://localhost:3600/api/graphql

## 📁 本地开发 vs 生产环境

### 数据库连接

| 环境 | 连接方式 | 配置来源 |
|------|----------|----------|
| 本地开发 (`pnpm dev`) | 直连 PostgreSQL | `.env` 中的 `DATABASE_URL` |
| 生产环境 (Workers) | Hyperdrive | `cloudflare.env.HYPERDRIVE.connectionString` |
| CLI 命令 (`migrate`) | Wrangler Proxy | `wrangler.jsonc` 中的 `localConnectionString` |

### 媒体存储

| 环境 | 存储方式 | 说明 |
|------|----------|------|
| 本地开发 (`pnpm dev`) | 数据库存储 | R2 不可用，文件保存在 PostgreSQL |
| Wrangler Dev | R2 模拟 | 使用 wrangler 的 R2 模拟 |
| 生产环境 | Cloudflare R2 | 真实的 R2 存储 |

## 🛠️ 开发模式对比

### 方案 1: Next.js Dev (推荐用于快速开发)

```bash
pnpm dev
```

**优点**:
- ✅ 快速热重载
- ✅ 最佳开发体验
- ✅ 支持 Turbo 模式

**限制**:
- ⚠️ 媒体文件存储在数据库（无 R2）
- ⚠️ 无法访问 Hyperdrive（使用 DATABASE_URL）

**适用场景**: 日常开发、调试业务逻辑、测试功能

### 方案 2: Wrangler Dev (用于完整模拟)

```bash
pnpm dev:wrangler
```

**优点**:
- ✅ 完整模拟 Cloudflare Workers 环境
- ✅ 可以使用 R2 存储（dev bucket: `gank-cms-dev`）
- ✅ 可以使用 Hyperdrive
- ✅ 使用独立的 dev 环境配置

**限制**:
- ⚠️ 热重载较慢
- ⚠️ 需要先构建项目

**适用场景**: 测试 Workers 特性、R2 上传、生产环境验证

**环境配置**: 使用 `wrangler.jsonc` 中的 `env.dev` 配置

## 📝 常见任务

### 创建新的数据库迁移

```bash
# 修改 collections 后运行
pnpm payload migrate:create

# 生成的迁移文件在 src/migrations/
```

### 查看迁移状态

```bash
pnpm payload migrate:status
```

### 回滚迁移

```bash
# 回滚最后一次迁移
pnpm payload migrate:down
```

### 重置数据库（危险操作）

```bash
# 删除所有表并重新迁移
pnpm payload migrate:reset
```

### 生成 TypeScript 类型

```bash
# 生成所有类型
pnpm generate:types

# 仅生成 Payload 类型
pnpm generate:types:payload

# 仅生成 Cloudflare 类型
pnpm generate:types:cloudflare
```

### 生成导入映射

```bash
pnpm generate:importmap
```

## 🔧 故障排除

### 问题 1: 数据库连接失败

**错误**: `Error: connect ECONNREFUSED` 或 `connection timeout`

**解决方案**:
1. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
2. 确认 PostgreSQL 数据库正在运行
3. 测试连接：
   ```bash
   psql postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev
   ```

### 问题 2: Hyperdrive 在本地不可用

**错误**: `Cannot read property 'connectionString' of undefined`

**解决方案**: 这是正常的！本地开发使用 `DATABASE_URL`，已在配置中处理。确保 `.env` 文件包含 `DATABASE_URL`。

### 问题 3: 媒体上传失败

**本地开发时的预期行为**:
- 使用 `pnpm dev`: 媒体存储在数据库（base64），适合开发
- 使用 `wrangler dev`: 可以使用 R2 模拟

**建议**: 本地开发时专注于业务逻辑，媒体功能在部署后测试。

### 问题 4: TypeScript 类型错误

**错误**: `Property 'HYPERDRIVE' does not exist on type 'CloudflareEnv'`

**解决方案**:
```bash
# 重新生成 Cloudflare 类型
pnpm generate:types:cloudflare
```

### 问题 5: 迁移失败

**错误**: `Migration failed` 或 `Column already exists`

**解决方案**:
```bash
# 查看迁移状态
pnpm payload migrate:status

# 如果需要重置（会删除所有数据）
pnpm payload migrate:reset

# 重新运行迁移
pnpm payload migrate
```

## 🔐 环境变量说明

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `PAYLOAD_SECRET` | PayloadCMS 加密密钥 | 使用 `openssl rand -hex 32` 生成 |
| `DATABASE_URL` | PostgreSQL 连接字符串（本地） | `postgresql://user:pass@host:port/db` |
| `NEXT_PUBLIC_URL` | 应用公开 URL | `http://localhost:3600` |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `CLOUDFLARE_ENV` | Cloudflare 环境名 | (空) |

## 📊 数据库连接优先级

PayloadCMS 配置按以下顺序选择数据库连接：

1. **本地开发**: `process.env.DATABASE_URL` (.env 文件)
2. **生产环境**: `cloudflare.env.HYPERDRIVE.connectionString` (Workers)
3. **CLI 命令**: Wrangler Proxy 的 `localConnectionString`

## 🎯 最佳实践

### 开发工作流

```bash
# 1. 修改 Collection 定义
vim src/collections/Posts.ts

# 2. 创建迁移
pnpm payload migrate:create

# 3. 运行迁移
pnpm payload migrate

# 4. 生成类型
pnpm generate:types:payload

# 5. 开始开发
pnpm dev
```

### Git 工作流

```bash
# .env 文件不应提交
echo ".env" >> .gitignore

# 但应提交 .env.example 作为模板
git add .env.example
```

### 数据库管理

- ✅ 总是先创建迁移再修改数据
- ✅ 在本地测试迁移后再部署
- ✅ 保留迁移历史记录
- ❌ 不要手动修改数据库 schema
- ❌ 不要直接编辑迁移文件

## 🚢 准备部署

### 部署前检查清单

- [ ] 所有迁移已创建并测试
- [ ] 类型定义已生成且无错误
- [ ] Lint 检查通过 (`pnpm lint`)
- [ ] 本地构建成功 (`pnpm build`)
- [ ] Cloudflare Hyperdrive 已配置
- [ ] 生产环境变量已设置

### 部署命令

```bash
# 完整部署
pnpm deploy

# 分步部署
pnpm deploy:database  # 1. 运行迁移
pnpm deploy:app       # 2. 部署应用
```

## 📚 相关资源

- [PayloadCMS 文档](https://payloadcms.com/docs)
- [Cloudflare Hyperdrive 文档](https://developers.cloudflare.com/hyperdrive/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [项目迁移说明](./MIGRATION_D1_TO_POSTGRES.md)

---

**最后更新**: 2025-10-26
**适用版本**: PayloadCMS 3.61.0 + PostgreSQL + Cloudflare Workers
