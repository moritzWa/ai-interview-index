'use client'

import { useMemo, useState } from 'react'
import type { Company } from '@/db/schema'
import { POLICIES, POLICY_LABELS, type Policy } from '@/db/schema'

export function CompanyList({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState<Policy[]>([])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return companies.filter((c) => {
      if (active.length && !active.includes(c.policy)) return false
      if (!needle) return true
      return `${c.name} ${c.process}`.toLowerCase().includes(needle)
    })
  }, [companies, q, active])

  const toggle = (p: Policy) =>
    setActive((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))

  return (
    <>
      <div className="controls">
        <input
          type="search"
          placeholder="Search companies…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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
      </div>

      {shown.length === 0 ? (
        <p className="muted small">
          Nothing matches. <a href="/new">Add a company</a>.
        </p>
      ) : (
        POLICIES.filter((p) => shown.some((c) => c.policy === p)).map((p) => (
          <section key={p}>
            <h2 className={`group-head`}>
              <span className={`tag ${p}`}>{POLICY_LABELS[p]}</span>
            </h2>
            <div className="rows">
              {shown
                .filter((c) => c.policy === p)
                .map((c) => (
                  <a className="row" key={c.id} href={`/c/${c.slug}`}>
                    <span className="nm">{c.name}</span>
                    <span className="pr">{c.process.split('\n')[0]}</span>
                  </a>
                ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
