'use client'

import { useMemo, useState } from 'react'
import type { Company } from '@/db/schema'
import { POLICIES, POLICY_LABELS, type Policy } from '@/db/schema'

/** One dropdown per facet, in the shape VC portfolio pages use. */
function Facet({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  if (options.length === 0) return null
  return (
    <select
      className="facet"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function CompanyList({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState<Policy[]>([])
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
      if (active.length && !active.includes(c.policy)) return false
      if (city && c.city !== city) return false
      if (industry && c.industry !== industry) return false
      if (!needle) return true
      return `${c.name} ${c.process} ${c.city ?? ''} ${c.industry ?? ''}`
        .toLowerCase()
        .includes(needle)
    })
  }, [companies, q, active, city, industry])

  const toggle = (p: Policy) =>
    setActive((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))

  const filtered = active.length > 0 || city || industry || q.trim()

  return (
    <>
      <div className="controls">
        <input
          type="search"
          placeholder="Search companies…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Facet label="Any location" value={city} options={cities} onChange={setCity} />
        <Facet label="Any industry" value={industry} options={industries} onChange={setIndustry} />
      </div>

      <div className="controls" style={{ marginTop: 0 }}>
        {POLICIES.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            aria-pressed={active.includes(p)}
            onClick={() => toggle(p)}
          >
            {POLICY_LABELS[p]}
          </button>
        ))}
        {filtered && (
          <button
            type="button"
            className="link"
            onClick={() => {
              setQ('')
              setActive([])
              setCity('')
              setIndustry('')
            }}
          >
            clear
          </button>
        )}
        <span className="small muted" style={{ marginLeft: 'auto' }}>
          {shown.length} of {companies.length}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="muted small">
          Nothing matches. <a href="/new">Add a company</a>.
        </p>
      ) : (
        POLICIES.filter((p) => shown.some((c) => c.policy === p)).map((p) => (
          <section key={p}>
            <h2 className="group-head">
              <span className={`tag ${p}`}>{POLICY_LABELS[p]}</span>
            </h2>
            <div className="rows">
              {shown
                .filter((c) => c.policy === p)
                .map((c) => (
                  <a className="row" key={c.id} href={`/c/${c.slug}`}>
                    <span className="nm">{c.name}</span>
                    <span className="pr">{c.process.split('\n')[0]}</span>
                    {c.city && <span className="meta">{c.city}</span>}
                  </a>
                ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
