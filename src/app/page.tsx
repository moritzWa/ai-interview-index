import { asc } from 'drizzle-orm'
import { companies, db, POLICIES, POLICY_BLURBS, POLICY_LABELS } from '@/db'
import { CompanyList } from './company-list'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const all = await db.select().from(companies).orderBy(asc(companies.name))
  const counts = Object.fromEntries(
    POLICIES.map((p) => [p, all.filter((c) => c.policy === p).length]),
  ) as Record<(typeof POLICIES)[number], number>

  return (
    <>
      <p className="small muted" style={{ marginTop: 0 }}>
        {POLICIES.map((p, i) => (
          <span key={p}>
            {i > 0 && ' · '}
            <span className={`tag ${p}`}>{POLICY_LABELS[p]}</span> {counts[p]} —{' '}
            {POLICY_BLURBS[p]}
          </span>
        ))}
      </p>
      <CompanyList companies={all} />
    </>
  )
}
