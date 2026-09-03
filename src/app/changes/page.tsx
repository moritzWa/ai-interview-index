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
      <h2 className="page">Recent changes</h2>
      <p className="quiet small" style={{ margin: "0 0 16px" }}>
        Every edit, newest first. Anything that looks wrong can be reverted in one click.
      </p>
      <div className="card" style={{ padding: 0 }}>
        {rows.length === 0 && <p className="quiet small" style={{ padding: 14 }}>Nothing yet.</p>}
        {rows.map(({ rev, company }) => (
          <div className="change" key={rev.id}>
            <span className="when">{when(rev.createdAt)}</span>
            <span className="small" style={{ flex: 1 }}>
              <a href={`/c/${company.slug}`}>{company.name}</a>{' '}
              <span className="quiet">{rev.summary}</span>
            </span>
            {rev.before && <RevertButton revisionId={rev.id} />}
          </div>
        ))}
      </div>
    </>
  )
}
