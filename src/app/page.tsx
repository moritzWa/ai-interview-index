import { asc } from 'drizzle-orm'
import { companies, db } from '@/db'
import { CompanyList } from './company-list'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const all = await db.select().from(companies).orderBy(asc(companies.name))

  // Declaring this a Dataset is the honest description: a maintained, sourced list
  // that changes, which is exactly what the competing listicles are not.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'AI Interview Index',
    description:
      'Which companies allow AI tools in their coding interviews, which ban them, and which designed the interview around AI.',
    url: SITE_URL,
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    isAccessibleForFree: true,
    creator: { '@type': 'Person', name: 'Moritz Wallawitsch', url: 'https://moritzw.com' },
    dateModified: new Date(Math.max(...all.map((c) => c.updatedAt), 0) * 1000).toISOString(),
    variableMeasured: ['company', 'AI policy in technical interviews', 'interview format'],
    hasPart: all.map((c) => ({
      '@type': 'Dataset',
      name: c.name,
      url: `${SITE_URL}/c/${c.slug}`,
      description: c.process.split('\n')[0],
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompanyList companies={all} />

      <div className="footer-cta">
        <p>
          Interviewed somewhere that is not listed, or spotted something wrong? Every field is
          editable and no account is needed.
        </p>
        <a className="btn" href="/new">
          Submit a company
        </a>
      </div>
    </>
  )
}
