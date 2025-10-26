# 数据库迁移总结：D1 → PostgreSQL (via Hyperdrive)

## ✅ 已完成的更改

### 1. 依赖包更新
- ✅ 添加：`@payloadcms/db-postgres@3.61.0`
- ✅ 移除：`@payloadcms/db-d1-sqlite@3.61.0`
- ✅ 移除：package.json 中的 drizzle-kit 版本锁定

### 2. PayloadCMS 配置 (`src/payload.config.ts`)
```typescript
// 已更新为使用 PostgreSQL 适配器
import { postgresAdapter } from '@payloadcms/db-postgres'

db: postgresAdapter({
  pool: {
    connectionString: cloudflare.env.HYPERDRIVE?.connectionString || process.env.DATABASE_URL || '',
    maxUses: 1, // Cloudflare Workers 环境必需
  },
})
```

**关键配置说明**：
- `maxUses: 1` - 必需项，因为 Workers 环境无法跨请求共享连接
- 支持本地开发（`process.env.DATABASE_URL`）和生产环境（`HYPERDRIVE.connectionString`）
- R2 存储配置保持不变

### 3. Cloudflare Workers 配置 (`wrangler.jsonc`)
✅ **已优化为多环境配置**

**开发环境** (`env.dev`):
```jsonc
"env": {
  "dev": {
    "name": "gank-cms-cf-dev",
    "hyperdrive": [
      {
        "binding": "HYPERDRIVE",
        "id": "9e37cb7342bb40f49c898924ab74cc71",
        "localConnectionString": "postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev"
      }
    ],
    "r2_buckets": [{"binding": "R2", "bucket_name": "gank-cms-dev"}]
  }
}
```

**生产环境** (`env.production`):
```jsonc
"env": {
  "production": {
    "name": "gank-cms-cf-production",
    "hyperdrive": [
      {
        "binding": "HYPERDRIVE",
        "id": "9e37cb7342bb40f49c898924ab74cc71"
      }
    ],
    "r2_buckets": [{"binding": "R2", "bucket_name": "gank-cms"}]
  }
}
```

详见：[Wrangler 环境配置说明](./WRANGLER_ENVIRONMENTS.md)

### 4. 部署脚本更新 (`package.json`)
```json
// 已移除 D1 PRAGMA optimize 命令
"deploy:database": "NODE_ENV=production PAYLOAD_SECRET=ignore payload migrate"
```

### 5. 迁移文件清理
- ✅ 删除所有旧的 D1 迁移文件（SQLite 格式）
- ✅ 创建新的迁移占位文件 `src/migrations/index.ts`

### 6. TypeScript 类型定义
- ✅ 已重新生成 `cloudflare-env.d.ts`，包含 HYPERDRIVE 类型

## 🚀 下一步操作

### 1. 配置本地开发环境

✅ **已完成**: `.env` 文件已配置 `DATABASE_URL`

当前配置：
```env
DATABASE_URL=postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev
```

### 2. 生成 PostgreSQL 迁移
```bash
# 创建初始数据库 schema 迁移
pnpm payload migrate:create

# 运行迁移
pnpm payload migrate
```

这将根据您的 Collections 配置生成 PostgreSQL 的初始 schema。

### 3. 本地开发测试

✅ **配置已优化**: 自动检测本地开发环境

- **本地开发** (`pnpm dev`): 使用 `.env` 中的 `DATABASE_URL`
- **生产环境** (Workers): 自动使用 Hyperdrive
- **CLI 命令**: 使用 wrangler proxy

```bash
# 启动开发服务器
pnpm devsafe
```

### 3. 运行迁移
```bash
# 运行数据库迁移创建表结构
pnpm payload migrate

# 或在生产环境
NODE_ENV=production pnpm payload migrate
```

### 4. 启动开发服务器
```bash
pnpm devsafe
```

访问 http://localhost:3600/admin 验证管理面板。

### 5. 部署到生产环境
```bash
# 完整部署（迁移 + 应用）到 production 环境
pnpm deploy

# 或分步部署
pnpm deploy:database  # 运行迁移到 production
pnpm deploy:app       # 部署应用到 production

# 使用 dev 环境测试（可选）
pnpm dev:wrangler     # 使用 dev 环境配置
```

**环境说明**:
- `dev`: 开发环境（worker: `gank-cms-cf-dev`, R2: `gank-cms-dev`）
- `production`: 生产环境（worker: `gank-cms-cf-production`, R2: `gank-cms`）

## ⚠️ 重要提醒

### Hyperdrive 配置检查
确认 Cloudflare Dashboard 中的 Hyperdrive 配置：
1. 登录 Cloudflare Dashboard
2. 进入 **Storage & Databases → Hyperdrive**
3. 验证 ID `9e37cb7342bb40f49c898924ab74cc71` 已正确配置
4. 确认连接到正确的 PostgreSQL 数据库

### 数据库权限
确保 PostgreSQL 数据库用户具有以下权限：
- CREATE TABLE
- ALTER TABLE
- CREATE INDEX
- SELECT, INSERT, UPDATE, DELETE

### 环境变量
**生产环境无需额外环境变量**，Hyperdrive 会自动提供连接字符串。

**本地开发**可选择：
- 使用 `localConnectionString`（已配置）
- 或使用 `DATABASE_URL` 环境变量

## 📊 架构对比

| 项目 | D1 (之前) | PostgreSQL + Hyperdrive (现在) |
|------|-----------|-------------------------------|
| 数据库类型 | SQLite (D1) | PostgreSQL |
| 连接方式 | 直接绑定 | Hyperdrive (连接池 + 缓存) |
| 本地开发 | Wrangler 模拟 | 直连 PostgreSQL |
| 迁移工具 | Drizzle Kit 0.30.6 | Drizzle Kit (最新) |
| 媒体存储 | R2 | R2 (保持不变) |
| 部署平台 | Cloudflare Workers | Cloudflare Workers (保持不变) |

## 🎯 预期优势

1. **更强大的查询能力**：PostgreSQL 支持复杂查询和全文搜索
2. **连接池优化**：Hyperdrive 提供全球连接池，降低延迟
3. **查询缓存**：Hyperdrive 自动缓存查询结果
4. **更好的扩展性**：PostgreSQL 更适合处理大规模数据
5. **生态系统**：丰富的 PostgreSQL 工具和扩展

## 🔍 故障排除

### TypeScript 错误
如果看到类型错误，运行：
```bash
pnpm generate:types
```

### 连接失败
检查数据库连接信息：
```bash
# 测试连接
psql postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev
```

### 迁移失败
确保数据库为空或备份现有数据：
```bash
# 查看迁移状态
pnpm payload migrate:status
```

## 📝 配置文件清单

已修改的文件：
- ✅ `package.json` - 依赖和脚本
- ✅ `src/payload.config.ts` - 数据库适配器
- ✅ `wrangler.jsonc` - Cloudflare 绑定
- ✅ `src/migrations/index.ts` - 迁移占位
- ✅ `cloudflare-env.d.ts` - TypeScript 类型（自动生成）

## 🎉 迁移完成

数据库迁移配置已完成！现在您可以：
1. 生成 PostgreSQL 迁移
2. 运行迁移创建表结构
3. 开始使用 PostgreSQL 后端的 PayloadCMS

---

**迁移日期**: 2025-10-26
**迁移类型**: D1 SQLite → PostgreSQL (via Hyperdrive)
**状态**: ✅ 配置完成，等待迁移执行
