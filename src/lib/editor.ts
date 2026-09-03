import { createHmac } from 'node:crypto'

/**
 * We never store a raw IP. A plain hash of one is reversible by enumerating the
 * whole v4 space, so the address is HMAC'd with a secret that should be rotated
 * (monthly is fine). Old hashes stop matching after a rotation, which is the
 * point: the identifier is for rate limiting and abuse cleanup, not for records.
 */
export function editorHash(req: Request): string | null {
  const secret = process.env.IP_HASH_SECRET
  const ip =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!secret || !ip) return null
  return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32)
}

const WINDOW_MS = 10 * 60 * 1000
const MAX_EDITS = 12
const hits = new Map<string, number[]>()

/** In-process limiter. Good enough for one box; swap for KV if this ever shards. */
export function rateLimited(key: string | null): boolean {
  if (!key) return false
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > MAX_EDITS
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
