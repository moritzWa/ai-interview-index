import { asc } from 'drizzle-orm'
import { companies, db, POLICY_BLURBS, POLICY_LABELS } from '@/db'
import { SITE_URL } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { CompanyList } from './company-list'

export const dynamic = 'force-dynamic'

const LICENSE = 'https://creativecommons.org/licenses/by-sa/4.0/'
const CREATOR = {
  '@type': 'Person',
  name: 'Moritz Wallawitsch',
  url: 'https://moritzw.com',
} as const

/**
 * Google's Dataset rich result rejects a `description` outside 50-5000 characters,
 * and a company whose `process` is empty or a one-liner used to produce exactly that.
 * Compose from fields that always exist, then clamp, so no row can emit a bad length.
 */
function partDescription(name: string, policy: keyof typeof POLICY_LABELS, process: string) {
  const firstLine = process.split('\n')[0].trim()
  const text = [
    `${name}: ${POLICY_LABELS[policy]}.`,
    POLICY_BLURBS[policy],
    firstLine,
    `How ${name} handles AI tools in its technical interviews, tracked in the AI Interview Index.`,
  ]
    .filter(Boolean)
    .join(' ')
  return text.length > 5000 ? `${text.slice(0, 4997).trimEnd()}...` : text
}

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
    license: LICENSE,
    isAccessibleForFree: true,
    creator: CREATOR,
    dateModified: new Date(Math.max(...all.map((c) => c.updatedAt), 0) * 1000).toISOString(),
    variableMeasured: ['company', 'AI policy in technical interviews', 'interview format'],
    hasPart: all.map((c) => ({
      '@type': 'Dataset',
      name: `${c.name} interview AI policy`,
      url: `${SITE_URL}/c/${c.slug}`,
      description: partDescription(c.name, c.policy, c.process),
      license: LICENSE,
      isAccessibleForFree: true,
      creator: CREATOR,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompanyList companies={all} />

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-dashed p-5">
        <p className="flex-1 text-xs text-muted-foreground">
          Interviewed somewhere that is not listed, or spotted something wrong? Every field is
          editable and no account is needed.
        </p>
        <Button asChild>
          <a href="/new">Submit a company</a>
        </Button>
      </div>
    </>
  )
}
