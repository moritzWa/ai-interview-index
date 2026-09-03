import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { companies, db, revisions } from '@/db'
import { diffFields, parseEditable, slugify, type Editable } from '@/lib/companies'
import { editorHash, rateLimited, turnstileOk } from '@/lib/editor'

/**
 * Edits publish instantly — there is no moderation queue. What keeps that safe is
 * the other half: every write lands in `revisions` first, so /changes can undo it.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Bad request.' }, { status: 400 })

  const hash = editorHash(req)
  if (rateLimited(hash)) {
    return NextResponse.json({ error: 'Too many edits, slow down a bit.' }, { status: 429 })
  }
  if (!(await turnstileOk(String(body.turnstileToken ?? '') || null))) {
    return NextResponse.json({ error: 'Bot check failed, reload and retry.' }, { status: 403 })
  }

  const parsed = parseEditable(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const existingId = typeof body.id === 'number' ? body.id : null
  const existing = existingId
    ? (await db.select().from(companies).where(eq(companies.id, existingId)).limit(1))[0]
    : undefined

  if (existingId && !existing) {
    return NextResponse.json({ error: 'That company no longer exists.' }, { status: 404 })
  }

  const before: Editable | null = existing
    ? {
        name: existing.name,
        policy: existing.policy,
        process: existing.process,
        sourceUrl: existing.sourceUrl,
        sourceNote: existing.sourceNote,
        city: existing.city,
        industry: existing.industry,
      }
    : null

  const changed = diffFields(before, parsed)
  if (existing && changed.length === 0) {
    return NextResponse.json({ slug: existing.slug, unchanged: true })
  }

  if (existing) {
    await db
      .update(companies)
      .set({ ...parsed, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(companies.id, existing.id))
    await db.insert(revisions).values({
      companyId: existing.id,
      kind: 'edit',
      before: JSON.stringify(before),
      after: JSON.stringify(parsed),
      summary: `changed ${changed.join(', ')}`,
      editorHash: hash,
    })
    return NextResponse.json({ slug: existing.slug })
  }

  // New entry. Slug collisions get a numeric suffix rather than an error.
  const base = slugify(parsed.name)
  let slug = base
  for (let n = 2; ; n++) {
    const taken = await db.select({ id: companies.id }).from(companies).where(eq(companies.slug, slug)).limit(1)
    if (taken.length === 0) break
    slug = `${base}-${n}`
  }

  const [created] = await db.insert(companies).values({ ...parsed, slug }).returning()
  await db.insert(revisions).values({
    companyId: created.id,
    kind: 'create',
    before: null,
    after: JSON.stringify(parsed),
    summary: 'added',
    editorHash: hash,
  })
  return NextResponse.json({ slug: created.slug })
}
