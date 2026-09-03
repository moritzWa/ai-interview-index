import { createHmac } from 'node:crypto'
import { and, eq, gt, sql } from 'drizzle-orm'
import { db, revisions } from '@/db'

/**
 * We never store a raw IP. A plain hash of one is reversible by enumerating the
 * whole v4 space, so the address is HMAC'd with a secret that should be rotated
 * (monthly is fine). Old hashes stop matching after a rotation, which is the
 * point: the identifier is for rate limiting and abuse cleanup, not for records.
 */
export function editorHash(req: Request): string | null {
  const secret = process.env.IP_HASH_SECRET
  const ip =
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!secret || !ip) return null
  return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32)
}

const WINDOW_SECONDS = 10 * 60
const MAX_PER_EDITOR = 8
const SAME_COMPANY_COOLDOWN = 60 * 5
const MAX_GLOBAL = 60

/**
 * Counted in Postgres rather than in memory, because the site runs on serverless
 * functions: an in-process counter resets on every cold start and is per-instance,
 * so a script that reconnects gets a fresh budget each time.
 *
 * Two ceilings. The per-editor one stops one address hammering the site; the global
 * one caps the damage from a rotating pool of addresses, where per-editor limits are
 * useless. Hitting the global ceiling degrades the site to read-only for a few
 * minutes, which is recoverable, unlike a few thousand junk revisions.
 */
export async function rateLimited(hash: string | null): Promise<false | string> {
  const since = Math.floor(Date.now() / 1000) - WINDOW_SECONDS

  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(revisions)
    .where(gt(revisions.createdAt, since))

  if (total >= MAX_GLOBAL) {
    return 'The site is getting an unusual number of edits and is briefly read-only. Try again in a few minutes.'
  }

  if (!hash) return false

  const [{ count: mine }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(revisions)
    .where(and(gt(revisions.createdAt, since), eq(revisions.editorHash, hash)))

  if (mine >= MAX_PER_EDITOR) {
    return `That is ${MAX_PER_EDITOR} edits in ten minutes. Slow down, or get in touch if you have a batch to add.`
  }

  return false
}

/**
 * One editor repeatedly rewriting the same entry is edit-warring, not contribution.
 * Wikipedia's three-revert rule in miniature: after an edit, that editor leaves the
 * entry alone for five minutes. Everyone else can still edit it, so a squatter
 * cannot lock a row.
 */
export async function editingTooFast(hash: string | null, companyId: number): Promise<boolean> {
  if (!hash) return false
  const since = Math.floor(Date.now() / 1000) - SAME_COMPANY_COOLDOWN
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(revisions)
    .where(
      and(
        gt(revisions.createdAt, since),
        eq(revisions.editorHash, hash),
        eq(revisions.companyId, companyId),
      ),
    )
  return count > 0
}

/** No-ops when Turnstile isn't configured, so local dev needs no keys. */
export async function turnstileOk(token: string | null, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })
  const json = (await res.json()) as { success?: boolean }
  return json.success === true
}
