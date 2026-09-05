'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { POLICIES, POLICY_BLURBS, POLICY_LABELS, type Policy } from '@/db/schema'
import { MAX_RESOURCES, type Resource } from '@/lib/companies'
import { getTurnstileToken } from '@/lib/turnstile-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  resources: Resource[]
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
  resources: [],
}

export function EditForm({ initial = EMPTY }: { initial?: EditFormValues }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof EditFormValues>(k: K, v: EditFormValues[K]) =>
    setValues((cur) => ({ ...cur, [k]: v }))

  const setResource = (i: number, r: Resource) =>
    setValues((cur) => ({ ...cur, resources: cur.resources.map((x, n) => (n === i ? r : x)) }))
  const addResource = () =>
    setValues((cur) => ({ ...cur, resources: [...cur.resources, { url: '', title: '' }] }))
  const removeResource = (i: number) =>
    setValues((cur) => ({ ...cur, resources: cur.resources.filter((_, n) => n !== i) }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const turnstileToken = await getTurnstileToken()
    const res = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...values, turnstileToken }),
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
    <form className="grid gap-5" onSubmit={submit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Company</Label>
        <Input id="name" required value={values.name} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="policy">Category</Label>
        <Select value={values.policy} onValueChange={(v) => set('policy', v as Policy)}>
          <SelectTrigger id="policy" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POLICIES.map((p) => (
              <SelectItem key={p} value={p}>
                {POLICY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-faint">{POLICY_BLURBS[values.policy]}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://company.com"
          value={values.website}
          onChange={(e) => set('website', e.target.value)}
        />
        <p className="text-xs text-faint">Used to show the company logo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="city">Location</Label>
          <Input
            id="city"
            placeholder="New York, Remote, SF…"
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="Legal AI, fintech, dev tools…"
            value={values.industry}
            onChange={(e) => set('industry', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="process">What the process looks like</Label>
        <Textarea
          id="process"
          rows={5}
          value={values.process}
          placeholder="E.g. 45min CoderPad screen, no AI allowed. Then a 4h onsite: system design, two coding rounds, hiring manager."
          onChange={(e) => set('process', e.target.value)}
        />
        <p className="text-xs text-faint">
          The first line shows in the table, so lead with the short version.
        </p>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">Links about their stance</legend>
        <p className="-mt-1 text-xs text-faint">
          Their engineering blog, a careers page, a press interview. These show on the company&apos;s
          page.
        </p>
        {values.resources.map((r, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://company.com/blog/post"
              value={r.url}
              onChange={(e) => setResource(i, { ...r, url: e.target.value })}
              className="flex-[2]"
            />
            <Input
              placeholder="What it is"
              value={r.title}
              onChange={(e) => setResource(i, { ...r, title: e.target.value })}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeResource(i)}
              aria-label="Remove link"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        {values.resources.length < MAX_RESOURCES && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-self-start"
            onClick={addResource}
          >
            <Plus className="size-3.5" /> Add a link
          </Button>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="sourceUrl">Source link</Label>
          <Input
            id="sourceUrl"
            type="url"
            placeholder="https://…"
            value={values.sourceUrl}
            onChange={(e) => set('sourceUrl', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sourceNote">Source note</Label>
          <Input
            id="sourceNote"
            placeholder="Candidate report, Feb 2026"
            value={values.sourceNote}
            onChange={(e) => set('sourceNote', e.target.value)}
          />
        </div>
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <input
        type="text"
        name="url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.url ?? ''}
        onChange={(e) => set('url', e.target.value)}
        className="absolute -left-[9999px] size-px opacity-0"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : values.id ? 'Save changes' : 'Add company'}
        </Button>
        <p className="text-xs text-faint">
          Publishes immediately, no account needed. Your edit appears in{' '}
          <a className="underline underline-offset-2" href="/changes">
            recent changes
          </a>{' '}
          and anyone can revert it.
        </p>
      </div>
    </form>
  )
}
