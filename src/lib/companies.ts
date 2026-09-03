import { POLICIES, type Policy } from '@/db/schema'

export type Resource = { url: string; title: string }

export const MAX_RESOURCES = 8

/** Stored as JSON text; always hand callers a real array, never a parse error. */
export function parseResources(raw: string | null): Resource[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? (v as Resource[]).filter((r) => r?.url) : []
  } catch {
    return []
  }
}

export type Editable = {
  name: string
  policy: Policy
  process: string
  sourceUrl: string | null
  sourceNote: string | null
  resources: string | null
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

  const rawResources = Array.isArray(f?.resources) ? (f.resources as unknown[]) : []
  const resources: Resource[] = []
  for (const item of rawResources.slice(0, MAX_RESOURCES + 1)) {
    const r = item as Record<string, unknown>
    const url = String(r?.url ?? '').trim()
    if (!url) continue
    if (!/^https?:\/\/\S+$/.test(url)) return { error: `Resource links must be http(s) URLs: ${url}` }
    resources.push({ url, title: String(r?.title ?? '').trim().slice(0, 140) })
  }
  if (resources.length > MAX_RESOURCES) {
    return { error: `Keep it to ${MAX_RESOURCES} links per company.` }
  }
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
    resources: resources.length ? JSON.stringify(resources) : null,
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
    'resources',
    'website',
    'city',
    'industry',
  ]
  return keys.filter((k) => before[k] !== after[k])
}

/** The hostname a logo lookup is keyed on, or null if the URL is unusable. */
export function logoHost(website: string | null): string | null {
  if (!website) return null
  try {
    return new URL(website).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Favicon first: it is the mark a company actually ships for small dark chrome, so
 * it survives dark mode, where many logo.dev wordmarks are black-on-transparent and
 * disappear. logo.dev is the fallback for the hosts that ship nothing usable.
 */
export function faviconUrl(website: string | null, size = 64): string | null {
  const host = logoHost(website)
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=${size}` : null
}

export function logoDevUrl(website: string | null, size = 40): string | null {
  const host = logoHost(website)
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN
  if (!host || !token) return null
  return `https://img.logo.dev/${host}?token=${token}&size=${size}&format=png&retina=true`
}
