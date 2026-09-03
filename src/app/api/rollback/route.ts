import { and, desc, eq, gt, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { companies, db, revisions } from '@/db'
import type { Editable } from '@/lib/companies'

/**
 * Wikipedia's rollback, scaled down. Undoes every edit one editor made in a window,
 * in one action, by restoring each affected company to the state it was in before
 * that editor first touched it.
 *
 * Admin-only, unlike ordinary revert. Public rollback would itself be the attack:
 * one request could erase a day of honest contributions.
 */
export async function POST(req: Request) {
  const token = req.headers.get('x-admin-token')
  const expected = process.env.ADMIN_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const { editorHash: target, hours = 24 } = (await req.json().catch(() => ({}))) as {
    editorHash?: string
    hours?: number
  }
  if (!target) return NextResponse.json({ error: 'Which editor?' }, { status: 400 })

  const since = Math.floor(Date.now() / 1000) - Math.min(hours, 24 * 30) * 3600

  const spree = await db
    .select()
    .from(revisions)
    .where(and(eq(revisions.editorHash, target), gt(revisions.createdAt, since)))
    .orderBy(desc(revisions.createdAt))

  if (spree.length === 0) return NextResponse.json({ reverted: 0, companies: [] })

  // Per company, the oldest `before` in the spree is the last known-good state.
  const oldest = new Map<number, string>()
  for (const rev of spree) if (rev.before) oldest.set(rev.companyId, rev.before)

  const ids = [...oldest.keys()]
  const affected = await db.select().from(companies).where(inArray(companies.id, ids))
  const now = Math.floor(Date.now() / 1000)
  const restored: string[] = []

  for (const company of affected) {
    const snapshot = JSON.parse(oldest.get(company.id)!) as Editable
    await db.update(companies).set({ ...snapshot, updatedAt: now }).where(eq(companies.id, company.id))
    await db.insert(revisions).values({
      companyId: company.id,
      kind: 'revert',
      before: JSON.stringify({
        name: company.name,
        policy: company.policy,
        process: company.process,
        sourceUrl: company.sourceUrl,
        sourceNote: company.sourceNote,
        resources: company.resources,
        website: company.website,
        city: company.city,
        industry: company.industry,
      }),
      after: JSON.stringify(snapshot),
      summary: `rolled back ${spree.length} edits from one editor`,
    })
    restored.push(company.slug)
  }

  return NextResponse.json({ reverted: restored.length, editsUndone: spree.length, companies: restored })
}
