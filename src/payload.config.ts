// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { searchPlugin } from '@payloadcms/plugin-search'
import { openapi, swaggerUI } from 'payload-oapi'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Detect environment: CLI commands use wrangler context, runtime uses async context
const cloudflare = process.argv.find((value) => value.match(/^(generate|migrate):?/))
  ? await getCloudflareContextFromWrangler()
  : await getCloudflareContext({ async: true })

// Check if running in local development (not in Cloudflare Workers)
const isLocalDev = process.env.NODE_ENV !== 'production' && !cloudflare.env.HYPERDRIVE

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Categories],
  editor: lexicalEditor(),
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: '简体中文',
        code: 'zh-CN',
      },
      {
        label: 'Deutsch',
        code: 'de',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      // Local development: use DATABASE_URL from .env
      // Production/Workers: use Hyperdrive connection string
      connectionString: process.env.DATABASE_URL || cloudflare.env.HYPERDRIVE?.connectionString || '',
      // maxUses: 1 is required for Cloudflare Workers (no connection pooling)
      // For local development, you can increase this for better performance
      maxUses: isLocalDev ? undefined : 1,
    },
  }),
  plugins: [
    openapi({
      openapiVersion: '3.0',
      metadata: {
        title: 'Gank CMS API',
        version: '1.0.0',
      },
    }),
    swaggerUI({}),
    payloadCloudPlugin(),
    // R2 Storage: only enabled when R2 binding is available (production/wrangler dev)
    // For local development with `next dev`, media uploads will be stored in database
    ...(cloudflare.env.R2
      ? [
          r2Storage({
            bucket: cloudflare.env.R2,
            collections: { media: true },
          }),
        ]
      : []),
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `Website — ${doc?.title || ''}`,
      generateDescription: ({ doc }) => doc?.excerpt || '',
    }),
    redirectsPlugin({
      collections: ['posts'],
    }),
    nestedDocsPlugin({
      collections: ['categories'],
    }),
    searchPlugin({
      collections: ['posts'],
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(`${'__wrangler'.replaceAll('_', '')}`).then(({ getPlatformProxy }) =>
    getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      experimental: { remoteBindings: process.env.NODE_ENV === 'production' },
    } satisfies GetPlatformProxyOptions),
  )
}
