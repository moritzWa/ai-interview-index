import { desc, eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { companies, db, POLICY_BLURBS, POLICY_LABELS, revisions } from '@/db'
import { parseResources } from '@/lib/companies'
import { SITE_URL } from '@/lib/site'
import { cn } from '@/lib/utils'
import { CompanyDetail } from './detail'

export const dynamic = 'force-dynamic'

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const LABEL_COLOR = {
  no_ai: 'text-no-ai',
  has_ai: 'text-has-ai',
  ai_native: 'text-ai-native',
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [company] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1)
  if (!company) return { title: 'Not found' }

  const title = `Does ${company.name} allow AI in interviews?`
  const description = `${company.name}: ${POLICY_LABELS[company.policy]}. ${company.process.split('\n')[0]}`.slice(0, 300)

  return {
    title,
    description,
    alternates: { canonical: `/c/${company.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/c/${company.slug}`, type: 'article' },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does ${company.name} allow AI in coding interviews?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${POLICY_LABELS[company.policy]}. ${company.process}`,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a
        href="/"
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All companies
      </a>

      <div className="mt-4 max-w-2xl">
        <h2 className="text-xl font-semibold tracking-tight">{company.name}</h2>
        <p className="mt-1 text-xs">
          <span className={cn('font-semibold', LABEL_COLOR[company.policy])}>
            {POLICY_LABELS[company.policy]}
          </span>{' '}
          <span className="text-faint">{POLICY_BLURBS[company.policy]}</span>
        </p>

        <div className="mt-6 space-y-4 text-[13.5px] leading-relaxed">
          {company.process ? (
            company.process.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
          ) : (
            <p className="text-faint italic">No description yet.</p>
          )}
        </div>

        {(company.sourceUrl || company.sourceNote) && (
          <p className="mt-5 text-xs text-faint">
            Source:{' '}
            {company.sourceUrl ? (
              <a
                className="underline underline-offset-2 hover:text-foreground"
                href={company.sourceUrl}
                rel="noreferrer nofollow"
                target="_blank"
              >
                {company.sourceNote || hostOf(company.sourceUrl)}
              </a>
            ) : (
              company.sourceNote
            )}
          </p>
        )}

        {resources.length > 0 && (
          <section className="mt-9">
            <h3 className="mb-3 text-[11px] font-medium tracking-widest text-faint uppercase">
              What they have said
            </h3>
            <ul className="space-y-2.5">
              {resources.map((r) => (
                <li key={r.url} className="flex flex-wrap items-baseline gap-x-2">
                  <a
                    className="underline underline-offset-2"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer nofollow"
                  >
                    {r.title || r.url}
                  </a>
                  <span className="text-xs text-faint">{hostOf(r.url)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CompanyDetail company={company} history={history} />
      </div>
    </>
  )
}
