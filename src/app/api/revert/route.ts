import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { companies, db, revisions } from '@/db'
import type { Editable } from '@/lib/companies'
import { editorHash, rateLimited } from '@/lib/editor'

/**
 * Undo one revision by re-applying its `before` snapshot. The revert is itself a
 * revision, so reverting a revert works and nothing is ever silently erased.
 * Create rows have no `before` — those are left alone rather than deleting a company.
 */
export async function POST(req: Request) {
  const { revisionId } = (await req.json().catch(() => ({}))) as { revisionId?: number }
  if (typeof revisionId !== 'number') {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }

  const hash = editorHash(req)
  if (rateLimited(hash)) {
    return NextResponse.json({ error: 'Too many edits, slow down a bit.' }, { status: 429 })
  }

  const [rev] = await db.select().from(revisions).where(eq(revisions.id, revisionId)).limit(1)
  if (!rev) return NextResponse.json({ error: 'No such revision.' }, { status: 404 })
  if (!rev.before) {
    return NextResponse.json(
      { error: 'That revision created the entry, so there is nothing to restore.' },
      { status: 400 },
    )
  }

  const restore = JSON.parse(rev.before) as Editable
  const [current] = await db.select().from(companies).where(eq(companies.id, rev.companyId)).limit(1)
  if (!current) return NextResponse.json({ error: 'That company no longer exists.' }, { status: 404 })

  await db
    .update(companies)
    .set({ ...restore, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(companies.id, rev.companyId))

  await db.insert(revisions).values({
    companyId: rev.companyId,
    kind: 'revert',
    before: JSON.stringify({
      name: current.name,
      policy: current.policy,
      process: current.process,
      sourceUrl: current.sourceUrl,
      sourceNote: current.sourceNote,
      city: current.city,
      industry: current.industry,
    }),
    after: JSON.stringify(restore),
    summary: `reverted revision #${rev.id}`,
    editorHash: hash,
  })

  return NextResponse.json({ slug: current.slug })
}
