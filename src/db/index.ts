import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Netlify injects NETLIFY_DATABASE_URL at build and runtime; DATABASE_URL is the
 * local-development fallback. Resolved lazily on first query rather than at import,
 * because the very first build of a project runs before the database is provisioned.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null = null

function connect() {
  if (cached) return cached
  const url = process.env.NETLIFY_DATABASE_URL ?? process.env.DATABASE_URL
  if (!url) throw new Error('No database URL. Set NETLIFY_DATABASE_URL or DATABASE_URL.')
  cached = drizzle(neon(url), { schema })
  return cached
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get: (_t, prop) => Reflect.get(connect(), prop),
})

export * from './schema'
