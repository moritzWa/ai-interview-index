'use client'

import { useMemo, useState } from 'react'
import type { Company } from '@/db/schema'
import { POLICIES, POLICY_BLURBS, POLICY_LABELS, type Policy } from '@/db/schema'
import { faviconUrl, logoDevUrl } from '@/lib/companies'
import { getTurnstileToken } from '@/lib/turnstile-client'

const SHORT: Record<Policy, string> = {
  no_ai: 'No AI',
  has_ai: 'Has AI',
  ai_native: 'AI-native',
}

/**
 * The policy cell is the edit surface: clicking a segment reclassifies the company
 * straight away, the same as any other edit, and lands in the changelog to be
 * reverted if it is wrong.
 */
function PolicyToggle({ company }: { company: Company }) {
  const [policy, setPolicy] = useState<Policy>(company.policy)
  const [busy, setBusy] = useState(false)

  async function choose(next: Policy) {
    if (next === policy || busy) return
    const previous = policy
    setPolicy(next)
    setBusy(true)
    const turnstileToken = await getTurnstileToken()
    const res = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: company.id,
        name: company.name,
        policy: next,
        process: company.process,
        sourceUrl: company.sourceUrl ?? '',
        sourceNote: company.sourceNote ?? '',
        city: company.city ?? '',
        industry: company.industry ?? '',
        turnstileToken,
      }),
    })
    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setPolicy(previous)
      alert(json.error ?? 'Could not save that change.')
    }
    setBusy(false)
  }

  return (
    <div className="seg" role="group" aria-label={`Interview policy for ${company.name}`}>
      {POLICIES.map((p) => (
        <button
          key={p}
          type="button"
          className={p}
          aria-pressed={policy === p}
          disabled={busy}
          title={POLICY_BLURBS[p]}
          onClick={() => choose(p)}
        >
          {SHORT[p]}
        </button>
      ))}
    </div>
  )
}

/**
 * Favicon first, logo.dev second, then nothing. Each step only runs when the one
 * before it actually fails to load, so a company with a usable favicon never costs
 * a logo.dev lookup.
 */
function Logo({ company }: { company: Company }) {
  const [step, setStep] = useState(0)
  const sources = [faviconUrl(company.website), logoDevUrl(company.website)].filter(
    Boolean,
  ) as string[]

  const src = sources[step]
  if (!src) return <span className="logo ph" aria-hidden />

  return (
    <img
      className="logo"
      src={src}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      onError={() => setStep((n) => n + 1)}
    />
  )
}

type SortKey = 'name' | 'process' | 'city' | 'policy'

/** Groups the three policies in escalating order rather than alphabetically, so
 * sorting the column reads as a spectrum instead of "ai_native, has_ai, no_ai". */
const POLICY_ORDER: Record<Policy, number> = { no_ai: 0, has_ai: 1, ai_native: 2 }

function SortHeader({
  label,
  column,
  sort,
  dir,
  onSort,
  align,
}: {
  label: string
  column: SortKey
  sort: SortKey
  dir: 1 | -1
  onSort: (c: SortKey) => void
  align?: 'right'
}) {
  const active = sort === column
  return (
    <th className={align === 'right' ? 'policycol' : undefined} aria-sort={active ? (dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="sorth" onClick={() => onSort(column)}>
        {label}
        <span className="caret" aria-hidden>
          {active ? (dir === 1 ? '\u2191' : '\u2193') : ''}
        </span>
      </button>
    </th>
  )
}

export function CompanyList({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')
  const [policy, setPolicy] = useState('')
  const [city, setCity] = useState('')
  const [industry, setIndustry] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const [dir, setDir] = useState<1 | -1>(1)

  /** Clicking the active column flips direction; a new column starts ascending. */
  function onSort(next: SortKey) {
    if (next === sort) setDir((d) => (d === 1 ? -1 : 1))
    else {
      setSort(next)
      setDir(1)
    }
  }

  const cities = useMemo(
    () => [...new Set(companies.map((c) => c.city).filter(Boolean) as string[])].sort(),
    [companies],
  )
  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry).filter(Boolean) as string[])].sort(),
    [companies],
  )

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const matched = companies.filter((c) => {
      if (policy && c.policy !== policy) return false
      if (city && c.city !== city) return false
      if (industry && c.industry !== industry) return false
      if (!needle) return true
      return `${c.name} ${c.process} ${c.city ?? ''} ${c.industry ?? ''}`
        .toLowerCase()
        .includes(needle)
    })

    const value = (c: Company) =>
      sort === 'policy' ? POLICY_ORDER[c.policy] : (c[sort] ?? '').toString().toLowerCase()

    return [...matched].sort((a, b) => {
      const av = value(a)
      const bv = value(b)
      // Rows missing a city sort last in both directions rather than clumping at
      // whichever end an empty string happens to land on.
      if (av === '' && bv !== '') return 1
      if (bv === '' && av !== '') return -1
      if (av < bv) return -dir
      if (av > bv) return dir
      return a.name.localeCompare(b.name)
    })
  }, [companies, q, policy, city, industry, sort, dir])

  const dirty = q.trim() || policy || city || industry

  return (
    <>
      <ul className="legend">
        {POLICIES.map((p) => (
          <li key={p}>
            <span className={`k ${p}`}>{POLICY_LABELS[p]}</span>
            <span className="quiet">{POLICY_BLURBS[p]}</span>
          </li>
        ))}
      </ul>

      <div className="controls">
        <input
          type="search"
          placeholder="Search companies…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={policy} onChange={(e) => setPolicy(e.target.value)} aria-label="Policy">
          <option value="">Any policy</option>
          {POLICIES.map((p) => (
            <option key={p} value={p}>
              {POLICY_LABELS[p]}
            </option>
          ))}
        </select>
        {cities.length > 0 && (
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Location">
            <option value="">Any location</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
        {industries.length > 0 && (
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            aria-label="Industry"
          >
            <option value="">Any industry</option>
            {industries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
        {dirty && (
          <button
            type="button"
            className="link"
            onClick={() => {
              setQ('')
              setPolicy('')
              setCity('')
              setIndustry('')
            }}
          >
            clear
          </button>
        )}
        <span className="count">
          {shown.length} of {companies.length}
        </span>
      </div>

      <div className="tablewrap">
        <table className="idx">
          <thead>
            <tr>
              <SortHeader label="Company" column="name" sort={sort} dir={dir} onSort={onSort} />
              <SortHeader
                label="Technical process"
                column="process"
                sort={sort}
                dir={dir}
                onSort={onSort}
              />
              <SortHeader label="Location" column="city" sort={sort} dir={dir} onSort={onSort} />
              <SortHeader
                label="AI in interviews"
                column="policy"
                sort={sort}
                dir={dir}
                onSort={onSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} className="quiet" style={{ padding: '22px 14px' }}>
                  Nothing matches those filters. <a href="/new">Add a company</a>.
                </td>
              </tr>
            )}
            {shown.map((c) => (
              <tr key={c.id}>
                <td className="nm">
                  <a href={`/c/${c.slug}`}>
                    <Logo company={c} />
                    {c.name}
                  </a>
                </td>
                <td className="pr">{c.process.split('\n')[0]}</td>
                <td className="meta">{c.city ?? '—'}</td>
                <td className="policycol">
                  <PolicyToggle company={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
