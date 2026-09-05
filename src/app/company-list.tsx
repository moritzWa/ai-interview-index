'use client'

import { useMemo, useState } from 'react'
import type { Company } from '@/db/schema'
import { POLICIES, POLICY_BLURBS, POLICY_LABELS, type Policy } from '@/db/schema'
import { faviconUrl, logoDevUrl } from '@/lib/companies'
import { getTurnstileToken } from '@/lib/turnstile-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SHORT: Record<Policy, string> = { no_ai: 'No AI', has_ai: 'Has AI', ai_native: 'AI-native' }

const ACTIVE: Record<Policy, string> = {
  no_ai: 'bg-no-ai-bg text-no-ai',
  has_ai: 'bg-has-ai-bg text-has-ai',
  ai_native: 'bg-ai-native-bg text-ai-native',
}

const LABEL_COLOR: Record<Policy, string> = {
  no_ai: 'text-no-ai',
  has_ai: 'text-has-ai',
  ai_native: 'text-ai-native',
}

/** Favicon first, logo.dev second, then a placeholder. Each step only runs when
 * the one before it fails, so a usable favicon costs no logo.dev lookup. */
function Logo({ company }: { company: Company }) {
  const [step, setStep] = useState(0)
  const sources = [faviconUrl(company.website), logoDevUrl(company.website)].filter(
    Boolean,
  ) as string[]
  const src = sources[step]

  if (!src) return <span className="size-5 shrink-0 rounded-sm bg-muted ring-1 ring-border" />
  return (
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      onError={() => setStep((n) => n + 1)}
      className="size-5 shrink-0 rounded-sm bg-muted object-contain"
    />
  )
}

/**
 * The policy cell is the edit surface: choosing a segment reclassifies the company
 * straight away and lands in the changelog like any other edit.
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
      // Only the field being changed. Everything omitted is left as-is server-side.
      body: JSON.stringify({ id: company.id, policy: next, turnstileToken }),
    })
    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setPolicy(previous)
      alert(json.error ?? 'Could not save that change.')
    }
    setBusy(false)
  }

  return (
    <div
      className="inline-flex gap-0.5 rounded-md bg-muted p-0.5 ring-1 ring-border"
      role="group"
      aria-label={`Interview policy for ${company.name}`}
    >
      {POLICIES.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={policy === p}
          disabled={busy}
          title={POLICY_BLURBS[p]}
          onClick={() => choose(p)}
          className={cn(
            'rounded-sm px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap transition-colors',
            policy === p
              ? ACTIVE[p]
              : 'text-faint hover:bg-accent hover:text-muted-foreground',
            busy && 'cursor-progress',
          )}
        >
          {SHORT[p]}
        </button>
      ))}
    </div>
  )
}

type SortKey = 'name' | 'process' | 'city' | 'policy'

/** Escalating rather than alphabetical, so sorting reads as a spectrum. */
const POLICY_ORDER: Record<Policy, number> = { no_ai: 0, has_ai: 1, ai_native: 2 }

export function CompanyList({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('')
  const [policy, setPolicy] = useState('all')
  const [city, setCity] = useState('all')
  const [industry, setIndustry] = useState('all')
  const [sort, setSort] = useState<SortKey>('name')
  const [dir, setDir] = useState<1 | -1>(1)

  const cities = useMemo(
    () => [...new Set(companies.map((c) => c.city).filter(Boolean) as string[])].sort(),
    [companies],
  )
  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry).filter(Boolean) as string[])].sort(),
    [companies],
  )

  /** Clicking the active column flips direction; a new column starts ascending. */
  function onSort(next: SortKey) {
    if (next === sort) setDir((d) => (d === 1 ? -1 : 1))
    else {
      setSort(next)
      setDir(1)
    }
  }

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const matched = companies.filter((c) => {
      if (policy !== 'all' && c.policy !== policy) return false
      if (city !== 'all' && c.city !== city) return false
      if (industry !== 'all' && c.industry !== industry) return false
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

  const dirty = q.trim() !== '' || policy !== 'all' || city !== 'all' || industry !== 'all'

  const header = (label: string, column: SortKey, className?: string) => (
    <TableHead
      className={className}
      aria-sort={sort === column ? (dir === 1 ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
          className?.includes('text-right') && 'flex-row-reverse',
        )}
      >
        {label}
        <span aria-hidden className="w-2 text-[9px] text-muted-foreground">
          {sort === column ? (dir === 1 ? '↑' : '↓') : ''}
        </span>
      </button>
    </TableHead>
  )

  return (
    <>
      <ul className="mb-4 grid list-none grid-cols-1 gap-x-5 p-0 text-xs md:grid-cols-3">
        {POLICIES.map((p) => (
          <li key={p} className="flex min-w-0 items-baseline gap-1.5">
            <span className={cn('font-semibold', LABEL_COLOR[p])}>{POLICY_LABELS[p]}</span>
            <span className="text-faint">{POLICY_BLURBS[p]}</span>
          </li>
        ))}
      </ul>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search companies…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-8 min-w-40 flex-1 text-xs"
        />
        <Select value={policy} onValueChange={setPolicy}>
          <SelectTrigger size="sm" className="text-xs" aria-label="Policy">
            <SelectValue placeholder="Any policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any policy</SelectItem>
            {POLICIES.map((p) => (
              <SelectItem key={p} value={p}>
                {POLICY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger size="sm" className="text-xs" aria-label="Location">
            <SelectValue placeholder="Any location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any location</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger size="sm" className="text-xs" aria-label="Industry">
            <SelectValue placeholder="Any industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any industry</SelectItem>
            {industries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dirty && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => {
              setQ('')
              setPolicy('all')
              setCity('all')
              setIndustry('all')
            }}
          >
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs tabular-nums text-faint">
          {shown.length} of {companies.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              {header('Company', 'name')}
              {header('Technical process', 'process')}
              {header('Location', 'city')}
              {header('AI in interviews', 'policy', 'text-right')}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-faint">
                  Nothing matches those filters. <a href="/new">Add a company</a>.
                </TableCell>
              </TableRow>
            )}
            {shown.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="w-px font-semibold whitespace-nowrap">
                  <a href={`/c/${c.slug}`} className="inline-flex items-center gap-2.5">
                    <Logo company={c} />
                    {c.name}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Clamped in CSS so the ellipsis lands on a real line break
                          at whatever width the table happens to be. */}
                      <span className="line-clamp-2">{c.process.split('\n')[0]}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      {c.process.split('\n')[0]}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="w-px text-xs whitespace-nowrap text-faint">
                  {c.city ?? '—'}
                </TableCell>
                <TableCell className="w-px pr-3 text-right">
                  <PolicyToggle company={c} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
