import { POLICIES, type Policy } from '@/db/schema'

export type Editable = {
  name: string
  policy: Policy
  process: string
  sourceUrl: string | null
  sourceNote: string | null
  website: string | null
  city: string | null
  industry: string | null
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function parseEditable(input: unknown): Editable | { error: string } {
  const f = input as Record<string, unknown>
  const name = String(f?.name ?? '').trim()
  const policy = String(f?.policy ?? '') as Policy
  const process = String(f?.process ?? '').trim()
  const sourceUrl = String(f?.sourceUrl ?? '').trim()
  const sourceNote = String(f?.sourceNote ?? '').trim()
  const website = String(f?.website ?? '').trim()
  const city = String(f?.city ?? '').trim()
  const industry = String(f?.industry ?? '').trim()

  if (name.length < 2 || name.length > 80) return { error: 'Company name must be 2-80 characters.' }
  if (!POLICIES.includes(policy)) return { error: 'Pick one of the three categories.' }
  if (process.length > 2000) return { error: 'Keep the process description under 2000 characters.' }
  if (sourceNote.length > 300) return { error: 'Keep the source note under 300 characters.' }
  if (sourceUrl && !/^https?:\/\/\S+$/.test(sourceUrl)) return { error: 'Source must be a http(s) URL.' }
  if (website && !/^https?:\/\/\S+$/.test(website)) return { error: 'Website must be a http(s) URL.' }
  if (city.length > 60) return { error: 'Keep the location under 60 characters.' }
  if (industry.length > 60) return { error: 'Keep the industry under 60 characters.' }

  return {
    name,
    policy,
    process,
    sourceUrl: sourceUrl || null,
    sourceNote: sourceNote || null,
    website: website || null,
    city: city || null,
    industry: industry || null,
  }
}

export function diffFields(before: Editable | null, after: Editable): string[] {
  if (!before) return ['added']
  const keys: (keyof Editable)[] = [
    'name',
    'policy',
    'process',
    'sourceUrl',
    'sourceNote',
    'website',
    'city',
    'industry',
  ]
  return keys.filter((k) => before[k] !== after[k])
}

/**
 * Logos come from logo.dev, keyed by the company's own domain. Without a token it
 * 401s, so fall back to the favicon service, which needs no key — the index should
 * still look finished on a fresh clone.
 */
export function logoUrl(website: string | null, size = 40): string | null {
  if (!website) return null
  let host: string
  try {
    host = new URL(website).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN
  return token
    ? `https://img.logo.dev/${host}?token=${token}&size=${size}&format=png&retina=true`
    : `https://www.google.com/s2/favicons?domain=${host}&sz=64`
}
