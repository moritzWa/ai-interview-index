'use client'

import { useEffect, useRef, useState } from 'react'
import { POLICIES, POLICY_BLURBS, POLICY_LABELS, type Policy } from '@/db/schema'

export type EditFormValues = {
  id?: number
  name: string
  policy: Policy
  process: string
  sourceUrl: string
  sourceNote: string
  website: string
  city: string
  industry: string
  /** Honeypot. Always empty for a person. */
  url?: string
}

const EMPTY: EditFormValues = {
  name: '',
  policy: 'no_ai',
  process: '',
  sourceUrl: '',
  sourceNote: '',
  website: '',
  city: '',
  industry: '',
}

/** Renders the Turnstile widget only when a site key is configured. */
function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!siteKey || !ref.current) return
    const w = window as unknown as { turnstile?: { render: (el: Element, o: object) => void } }
    const render = () => w.turnstile?.render(ref.current!, { sitekey: siteKey, callback: onToken })
    if (w.turnstile) return render()
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = render
    document.head.appendChild(s)
  }, [siteKey, onToken])

  if (!siteKey) return null
  return <div ref={ref} />
}

export function EditForm({ initial = EMPTY }: { initial?: EditFormValues }) {
  const [values, setValues] = useState(initial)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof EditFormValues>(k: K, v: EditFormValues[K]) =>
    setValues((cur) => ({ ...cur, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...values, turnstileToken: token }),
    })
    const json = (await res.json()) as { slug?: string; error?: string }
    if (!res.ok || !json.slug) {
      setError(json.error ?? 'Something went wrong.')
      setSaving(false)
      return
    }
    window.location.href = `/c/${json.slug}`
  }

  return (
    <form className="edit" onSubmit={submit}>
      <label>
        Company
        <input
          type="text"
          required
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </label>

      <label>
        Category
        <select value={values.policy} onChange={(e) => set('policy', e.target.value as Policy)}>
          {POLICIES.map((p) => (
            <option key={p} value={p}>
              {POLICY_LABELS[p]}
            </option>
          ))}
        </select>
        <span className="small quiet">{POLICY_BLURBS[values.policy]}</span>
      </label>

      <label>
        Website
        <input
          type="url"
          placeholder="https://company.com"
          value={values.website}
          onChange={(e) => set('website', e.target.value)}
        />
        <span className="small quiet">Used to show the company logo.</span>
      </label>

      <div className="pair">
        <label>
          Location
          <input
            type="text"
            placeholder="New York, Remote, SF…"
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </label>
        <label>
          Industry
          <input
            type="text"
            placeholder="Legal AI, fintech, dev tools…"
            value={values.industry}
            onChange={(e) => set('industry', e.target.value)}
          />
        </label>
      </div>

      <label>
        What the process looks like
        <textarea
          value={values.process}
          placeholder="E.g. 45min CoderPad screen, no AI allowed. Then a 4h onsite: system design, two coding rounds, hiring manager."
          onChange={(e) => set('process', e.target.value)}
        />
        <span className="small quiet">
          First line shows in the list, so lead with the short version.
        </span>
      </label>

      <label>
        Source link (optional)
        <input
          type="url"
          placeholder="https://…"
          value={values.sourceUrl}
          onChange={(e) => set('sourceUrl', e.target.value)}
        />
      </label>

      <label>
        Source note (optional)
        <input
          type="text"
          placeholder="Candidate report, Feb 2026 — or a quote from their careers page."
          value={values.sourceNote}
          onChange={(e) => set('sourceNote', e.target.value)}
        />
      </label>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <input
        type="text"
        name="url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.url ?? ''}
        onChange={(e) => set('url', e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <Turnstile onToken={setToken} />
      {error && <p className="err">{error}</p>}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Saving…' : values.id ? 'Save changes' : 'Add company'}
      </button>
      <p className="small quiet" style={{ margin: 0 }}>
        Publishes immediately. No account needed. Your edit appears in{' '}
        <a href="/changes">recent changes</a> and anyone can revert it.
      </p>
    </form>
  )
}
