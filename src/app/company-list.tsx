'use client'

import { useMemo, useState } from 'react'
import type { Company } from '@/db/schema'
import { POLICIES, POLICY_BLURBS, POLICY_LABELS, type Policy } from '@/db/schema'
import { logoUrl } from '@/lib/companies'

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

/** Hidden rather than broken-image when the lookup misses, which is common for
 * small or stealth companies. */
function Logo({ company }: { company: Company }) {
  const src = logoUrl(company.website, 40)
  if (!src) return <span className="logo ph" aria-hidden />
  return (
    <img
      className="logo"
      src={src}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
  )
}

export function CompanyList({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')
  const [policy, setPolicy] = useState('')
  const [city, setCity] = useState('')
  const [industry, setIndustry] = useState('')

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
    return companies.filter((c) => {
      if (policy && c.policy !== policy) return false
      if (city && c.city !== city) return false
      if (industry && c.industry !== industry) return false
      if (!needle) return true
      return `${c.name} ${c.process} ${c.city ?? ''} ${c.industry ?? ''}`
        .toLowerCase()
        .includes(needle)
    })
  }, [companies, q, policy, city, industry])

  const dirty = q.trim() || policy || city || industry

  return (
    <>
      <p className="legend">
        {POLICIES.map((p) => (
          <span key={p}>
            <span className={`k ${p}`}>{POLICY_LABELS[p]}</span> — {POLICY_BLURBS[p]}
          </span>
        ))}
      </p>

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
              <th>Company</th>
              <th>Technical process</th>
              <th>Location</th>
              <th className="policycol">AI in interviews</th>
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
