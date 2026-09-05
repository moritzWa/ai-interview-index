import { desc, eq } from 'drizzle-orm'
import { companies, db, revisions } from '@/db'
import { when } from '@/lib/time'
import { RevertButton } from './revert-button'

export const dynamic = 'force-dynamic'

export default async function Changes() {
  const rows = await db
    .select({ rev: revisions, company: companies })
    .from(revisions)
    .innerJoin(companies, eq(revisions.companyId, companies.id))
    .orderBy(desc(revisions.createdAt))
    .limit(50)

  return (
    <div className="max-w-2xl">
      <h2 className="text-base font-semibold tracking-tight">Recent changes</h2>
      <p className="mt-1 mb-5 text-xs text-faint">
        Every edit, newest first. Anything that looks wrong can be reverted in one click.
      </p>
      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {rows.length === 0 && <p className="p-4 text-xs text-faint">Nothing yet.</p>}
        {rows.map(({ rev, company }) => (
          <div key={rev.id} className="flex items-baseline gap-3 px-4 py-2.5 text-xs">
            <span className="w-14 shrink-0 text-faint">{when(rev.createdAt)}</span>
            <span className="flex-1">
              <a href={`/c/${company.slug}`} className="font-medium">
                {company.name}
              </a>{' '}
              <span className="text-muted-foreground">{rev.summary}</span>
            </span>
            {rev.before && <RevertButton revisionId={rev.id} />}
          </div>
        ))}
      </div>
    </div>
  )
}
