import type { MetadataRoute } from 'next'
import { companies, db } from '@/db'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db.select().from(companies)
  const newest = rows.reduce((max, c) => Math.max(max, c.updatedAt), 0)

  return [
    { url: SITE_URL, lastModified: new Date(newest * 1000), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/changes`, changeFrequency: 'daily', priority: 0.3 },
    { url: `${SITE_URL}/new`, changeFrequency: 'monthly', priority: 0.3 },
    ...rows.map((c) => ({
      url: `${SITE_URL}/c/${c.slug}`,
      lastModified: new Date(c.updatedAt * 1000),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
