import { desc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { companies, db, POLICY_BLURBS, POLICY_LABELS, revisions } from '@/db'
import { parseResources } from '@/lib/companies'
import { CompanyDetail } from './detail'

export const dynamic = 'force-dynamic'

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [company] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1)
  if (!company) notFound()

  const history = await db
    .select()
    .from(revisions)
    .where(eq(revisions.companyId, company.id))
    .orderBy(desc(revisions.createdAt))
    .limit(20)

  const resources = parseResources(company.resources)

  return (
    <>
      <p className="small quiet" style={{ marginTop: 0 }}>
        <a href="/">← All companies</a>
      </p>
      <h2 className="page" style={{ fontSize: 20 }}>{company.name}</h2>
      <p style={{ margin: '0 0 24px' }}>
        <span className={`k ${company.policy}`} style={{ fontWeight: 580 }}>{POLICY_LABELS[company.policy]}</span>{' '}
        <span className="small quiet">{POLICY_BLURBS[company.policy]}</span>
      </p>

      <p style={{ whiteSpace: 'pre-wrap' }}>{company.process || <em className="quiet">No description yet.</em>}</p>

      {(company.sourceUrl || company.sourceNote) && (
        <p className="small quiet">
          Source:{' '}
          {company.sourceUrl ? (
            <a href={company.sourceUrl} rel="noreferrer nofollow" target="_blank">
              {company.sourceNote || new URL(company.sourceUrl).hostname}
            </a>
          ) : (
            company.sourceNote
          )}
        </p>
      )}

      {resources.length > 0 && (
        <>
          <h3 className="section">What they have said</h3>
          <ul className="reslist">
            {resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer nofollow">
                  {r.title || r.url}
                </a>
                <span className="quiet small"> {hostOf(r.url)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <CompanyDetail company={company} history={history} />
    </>
  )
}
