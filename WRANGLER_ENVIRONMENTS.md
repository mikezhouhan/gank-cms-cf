# Wrangler 环境配置说明

## 🎯 配置结构

项目采用**多环境配置**，在 `wrangler.jsonc` 中明确区分开发和生产环境。

### 环境配置概览

```jsonc
{
  "name": "gank-cms-cf",  // 默认 worker 名称（不推荐直接使用）
  "env": {
    "dev": {
      "name": "gank-cms-cf-dev",           // 开发环境 worker
      "hyperdrive": [...],                  // 开发环境 Hyperdrive
      "r2_buckets": ["gank-cms-dev"]        // 开发环境 R2 bucket
    },
    "production": {
      "name": "gank-cms-cf-production",     // 生产环境 worker
      "hyperdrive": [...],                  // 生产环境 Hyperdrive
      "r2_buckets": ["gank-cms"]            // 生产环境 R2 bucket
    }
  }
}
```

## 📋 环境对比表

| 环境 | Worker 名称 | Hyperdrive ID | R2 Bucket | 数据库连接 |
|------|------------|---------------|-----------|-----------|
| **Dev** | `gank-cms-cf-dev` | `9e37cb7342bb40f49c898924ab74cc71` | `gank-cms-dev` | `localConnectionString` |
| **Production** | `gank-cms-cf-production` | `9e37cb7342bb40f49c898924ab74cc71` | `gank-cms` | Hyperdrive 自动连接 |

## 🚀 使用方法

### 开发环境

#### 方法 1: Next.js Dev（推荐日常开发）

```bash
pnpm dev
```

- ✅ 不使用 Cloudflare Workers
- ✅ 直连 PostgreSQL（通过 `.env` 中的 `DATABASE_URL`）
- ✅ 媒体存储在数据库
- ✅ 快速热重载

#### 方法 2: Wrangler Dev（测试 Workers 环境）

```bash
pnpm dev:wrangler
```

等效于：
```bash
wrangler dev --env dev
```

- ✅ 使用 `dev` 环境配置
- ✅ Worker 名称: `gank-cms-cf-dev`
- ✅ 使用 Hyperdrive 连接数据库
- ✅ 使用 R2 bucket: `gank-cms-dev`
- ✅ 完整模拟生产环境

### 生产环境

```bash
pnpm deploy
```

等效于：
```bash
# 1. 运行迁移
NODE_ENV=production CLOUDFLARE_ENV=production pnpm payload migrate

# 2. 构建并部署
opennextjs-cloudflare build -e production
opennextjs-cloudflare deploy -e production
```

- ✅ 使用 `production` 环境配置
- ✅ Worker 名称: `gank-cms-cf-production`
- ✅ 使用 Hyperdrive 连接数据库
- ✅ 使用 R2 bucket: `gank-cms`

## 🔧 配置细节

### Dev 环境配置

```jsonc
"dev": {
  "name": "gank-cms-cf-dev",
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "9e37cb7342bb40f49c898924ab74cc71",
      // 本地连接字符串，用于 wrangler CLI 命令（如 migrate）
      "localConnectionString": "postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "gank-cms-dev"  // 开发专用 bucket
    }
  ]
}
```

**特点**:
- `localConnectionString`: CLI 命令（migrate、generate）使用此连接
- 独立的 R2 bucket，避免污染生产数据

### Production 环境配置

```jsonc
"production": {
  "name": "gank-cms-cf-production",
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "9e37cb7342bb40f49c898924ab74cc71",
      // 生产环境不需要 localConnectionString（通过 wrangler 远程连接）
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "gank-cms"  // 生产 bucket
    }
  ]
}
```

**特点**:
- 不包含 `localConnectionString`（使用 wrangler 远程绑定）
- 使用生产级 R2 bucket

## 📝 命令速查

### 开发

| 命令 | 环境 | 用途 |
|------|------|------|
| `pnpm dev` | 本地 Next.js | 日常开发 |
| `pnpm dev:wrangler` | Wrangler `dev` | 测试 Workers 特性 |
| `pnpm devsafe` | 本地 Next.js | 清理缓存并启动 |

### 数据库

| 命令 | 环境 | 用途 |
|------|------|------|
| `pnpm payload migrate:create` | 本地 | 创建迁移 |
| `pnpm payload migrate` | 本地 | 运行迁移（开发环境） |
| `NODE_ENV=production pnpm payload migrate` | `production` | 运行迁移（生产环境） |

### 部署

| 命令 | 环境 | 用途 |
|------|------|------|
| `pnpm deploy` | `production` | 完整部署（迁移 + 应用） |
| `pnpm deploy:database` | `production` | 仅运行迁移 |
| `pnpm deploy:app` | `production` | 仅部署应用 |

### 类型生成

| 命令 | 用途 |
|------|------|
| `pnpm generate:types` | 生成所有类型 |
| `pnpm generate:types:payload` | 生成 Payload 类型 |
| `pnpm generate:types:cloudflare` | 生成 Cloudflare 环境类型 |

## 🔍 环境变量

### 本地开发 (`.env`)

```env
# PayloadCMS 密钥
PAYLOAD_SECRET=153fa73500c0d30559fe447b054752a1fc8368dd00b85939b27ab1b63c365b97

# 公开 URL
NEXT_PUBLIC_URL=http://localhost:3600

# PostgreSQL 连接（仅用于 `pnpm dev`）
DATABASE_URL=postgresql://gank:GankInterview123@43.130.42.34:36432/gank_cms_dev
```

### Wrangler Dev

使用 `wrangler.jsonc` 中的 `env.dev` 配置，通过 Hyperdrive 和 R2 绑定自动注入。

### 生产环境

通过 Cloudflare Dashboard 配置的环境变量：
- `PAYLOAD_SECRET`: 在 Workers 设置中配置
- `NEXT_PUBLIC_URL`: 通过 wrangler 或 Dashboard 配置

## 🎯 最佳实践

### ✅ 推荐做法

1. **日常开发**: 使用 `pnpm dev`（快速、简单）
2. **测试 Workers 特性**: 使用 `pnpm dev:wrangler`（完整环境）
3. **明确环境**: 始终使用 `-e` 标志指定环境
4. **分离资源**: dev 和 production 使用不同的 R2 bucket

### ❌ 避免做法

1. **不使用环境标志**: 避免使用默认配置（顶层配置）
2. **混用资源**: 不要在 dev 和 production 之间共享 R2 bucket
3. **硬编码环境**: 不要在代码中硬编码环境名称

## 🔄 迁移路径

### 从旧配置迁移

**之前** (不规范):
```jsonc
{
  "name": "gank-cms-cf",
  "hyperdrive": [...],  // 顶层配置，不明确
  "r2_buckets": [...]
}
```

**现在** (规范):
```jsonc
{
  "name": "gank-cms-cf",
  "env": {
    "dev": {...},        // 明确的 dev 配置
    "production": {...}  // 明确的 production 配置
  }
}
```

## 📊 数据库连接流程

### 本地开发 (`pnpm dev`)

```
Next.js App
    ↓
process.env.DATABASE_URL (.env 文件)
    ↓
PostgreSQL (直连)
```

### Wrangler Dev (`pnpm dev:wrangler`)

```
Cloudflare Worker (dev)
    ↓
cloudflare.env.HYPERDRIVE.connectionString
    ↓
Hyperdrive (dev)
    ↓
PostgreSQL
```

### 生产环境 (`pnpm deploy`)

```
Cloudflare Worker (production)
    ↓
cloudflare.env.HYPERDRIVE.connectionString
    ↓
Hyperdrive (production)
    ↓
PostgreSQL (生产数据库)
```

## 🛡️ 安全建议

1. **分离 Hyperdrive ID**: 如果生产环境使用不同的数据库，创建独立的 Hyperdrive 配置
2. **环境隔离**: 确保 dev 和 production 完全隔离
3. **密钥管理**: 使用 Cloudflare Secrets 管理敏感信息
4. **访问控制**: 限制 dev 环境的访问权限

## 📚 相关文档

- [本地开发指南](./LOCAL_DEVELOPMENT.md)
- [迁移总结](./MIGRATION_D1_TO_POSTGRES.md)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler 配置参考](https://developers.cloudflare.com/workers/wrangler/configuration/)

---

**最后更新**: 2025-10-26
**配置版本**: Wrangler 4.x + Multi-Environment
