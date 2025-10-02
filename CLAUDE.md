# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PayloadCMS 3.x application deployed on Cloudflare Workers with D1 SQLite database and R2 storage. Built with Next.js 15, using OpenNext Cloudflare adapter for deployment.

## Environment & Deployment Architecture

### Cloudflare Bindings (wrangler.jsonc)
- **D1**: SQLite database binding (database_id: bc25027a-992c-4edf-b1d0-7d55b871113a)
- **R2**: Object storage for media uploads (bucket_name: gank-cms)
- **ASSETS**: Static assets served from .open-next/assets
- **PAYLOAD_SECRET**: Required environment variable (generate with `openssl rand -hex 32`)

### Key Configuration Files
- `payload.config.ts`: Uses `getCloudflareContext()` to access bindings in different modes (CLI vs runtime)
- `next.config.ts`: Configures webpack extension aliases and PayloadCMS integration
- `open-next.config.ts`: OpenNext Cloudflare adapter configuration
- `wrangler.jsonc`: Cloudflare Workers configuration with production environment

**Important**: Cloudflare context initialization differs between runtime and CLI commands. The config uses `process.argv` detection to switch between `getCloudflareContextFromWrangler()` (for migrate/generate) and `getCloudflareContext({ async: true })` (for runtime).

## Development Commands

### Local Development
```bash
pnpm dev              # Start Next.js dev server (DO NOT RUN - blocks terminal)
pnpm devsafe          # Clean build artifacts and start dev server
```

**Note**: Avoid running `pnpm dev` in automated contexts as it runs indefinitely.

### Building & Deployment
```bash
pnpm build            # Build Next.js app (8GB memory allocation)
pnpm deploy           # Full deployment (database + app)
pnpm deploy:database  # Run migrations and optimize D1 database
pnpm deploy:app       # Build and deploy to Cloudflare Workers
pnpm preview          # Local preview of production build
```

**Database Operations**: All database migrations must be manually confirmed by user. Never run database commands automatically.

### Code Quality
```bash
pnpm lint             # Run Next.js ESLint
```

### Testing
```bash
pnpm test             # Run all tests (integration + e2e)
pnpm test:int         # Integration tests with Vitest
pnpm test:e2e         # E2E tests with Playwright
```

### Type Generation
```bash
pnpm generate:types              # Generate all types
pnpm generate:types:payload      # Generate PayloadCMS types
pnpm generate:types:cloudflare   # Generate Cloudflare env types
pnpm generate:importmap          # Generate PayloadCMS import map
```

### Payload CLI
```bash
pnpm payload                     # Access Payload CLI
pnpm payload migrate:create      # Create new migration (required before deployment)
```

### Wrangler (Cloudflare CLI)
```bash
pnpm wrangler login              # Authenticate with Cloudflare
pnpm wrangler help               # View Wrangler commands
```

## Application Architecture

### Next.js App Router Structure

**Route Groups**:
- `(payload)/`: PayloadCMS admin interface and API routes
  - `/admin`: Admin panel UI
  - `/api`: REST and GraphQL API endpoints
- `(frontend)/`: Public-facing pages
- `my-route/`: Example custom route

**Path Aliases** (tsconfig.json):
- `@/*`: Maps to `./src/*`
- `@payload-config`: Maps to `./src/payload.config.ts`

### PayloadCMS Collections

**Users** (`src/collections/Users.ts`):
- Auth-enabled collection with admin panel access
- Email used as title field

**Media** (`src/collections/Media.ts`):
- Upload-enabled collection
- Stored in Cloudflare R2 bucket
- R2 integration via `@payloadcms/storage-r2` plugin

**Configuration**: `src/payload.config.ts` uses:
- `@payloadcms/db-d1-sqlite` for database adapter
- `@payloadcms/richtext-lexical` for rich text editor
- `@payloadcms/storage-r2` for media storage
- `@payloadcms/payload-cloud` plugin

### Database Migrations

Migrations are located in `src/migrations/`. The system uses Drizzle Kit 0.30.6 (pinned via overrides in package.json).

**Migration workflow**:
1. Create migration: `pnpm payload migrate:create`
2. Review generated migration file
3. Deploy: `pnpm run deploy` (runs migrations + optimizes + deploys)

**Important**: Production migrations use `NODE_ENV=production` and connect to remote D1 database.

## Testing Structure

### Integration Tests (Vitest)
- Location: `tests/int/**/*.int.spec.ts`
- Environment: jsdom
- Config: `vitest.config.mts`
- Setup: `vitest.setup.ts`

### E2E Tests (Playwright)
- Location: `tests/e2e/**/*.e2e.spec.ts`
- Config: `playwright.config.ts`

## Known Limitations & Issues

### GraphQL
GraphQL support is not fully guaranteed when deployed due to [upstream Cloudflare Workers issues](https://github.com/cloudflare/workerd/issues/5175).

### Worker Size Limits
This template requires the **Paid Workers plan** due to 3MB bundle size limits. Be mindful when adding dependencies as they can quickly exceed limits.

### Deployment Environment
Worker logs are **opt-in** and count against Cloudflare quota. Enable via Cloudflare dashboard if needed.

## Important Constraints

1. **Database operations require manual confirmation** - never automate migration creation or execution
2. **Avoid running dev server in background** - `pnpm dev` blocks terminal indefinitely
3. **Use pnpm** - project is configured for pnpm 9+ (see package.json engines)
4. **Node version**: ^18.20.2 || >=20.9.0
5. **Memory allocation**: Build process requires 8GB (`--max-old-space-size=8000`)
6. **Production environment**: Set `CLOUDFLARE_ENV` environment variable for environment-specific deployments
