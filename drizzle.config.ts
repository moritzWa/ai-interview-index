import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './netlify/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NETLIFY_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
  },
} satisfies Config
