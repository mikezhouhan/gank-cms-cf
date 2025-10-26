// PostgreSQL migrations will be generated here
// Run: pnpm payload migrate:create

import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export const migrations: {
  up: (args: MigrateUpArgs) => Promise<void>
  down: (args: MigrateDownArgs) => Promise<void>
  name: string
}[] = []
