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
    <>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>Recent changes</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Every edit, newest first. Anything that looks wrong can be reverted in one click.
      </p>
      <div style={{ borderTop: '1px solid var(--line)' }}>
        {rows.length === 0 && <p className="muted small">Nothing yet.</p>}
        {rows.map(({ rev, company }) => (
          <div className="change" key={rev.id}>
            <span className="when">{when(rev.createdAt)}</span>
            <span className="small" style={{ flex: 1 }}>
              <a href={`/c/${company.slug}`}>{company.name}</a>{' '}
              <span className="muted">{rev.summary}</span>
            </span>
            {rev.before && <RevertButton revisionId={rev.id} />}
          </div>
        ))}
      </div>
    </>
  )
}
