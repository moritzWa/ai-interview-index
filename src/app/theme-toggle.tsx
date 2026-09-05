'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Choice = 'system' | 'light' | 'dark'

const KEY = 'aii-theme'

const OPTIONS: { key: Choice; label: string; Icon: typeof Monitor }[] = [
  { key: 'system', label: 'Match system', Icon: Monitor },
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: Moon },
]

export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>('system')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Choice | null
      if (saved === 'light' || saved === 'dark' || saved === 'system') setChoice(saved)
    } catch {
      // Private windows and blocked site data throw on access; the default is fine.
    }
  }, [])

  function pick(next: string) {
    if (next !== 'system' && next !== 'light' && next !== 'dark') return
    setChoice(next)
    const root = document.documentElement
    if (next === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Preference just won't persist. Not worth surfacing.
    }
  }

  return (
    <ToggleGroup
      type="single"
      value={choice}
      onValueChange={(v) => v && pick(v)}
      variant="outline"
      size="sm"
      aria-label="Colour theme"
    >
      {OPTIONS.map(({ key, label, Icon }) => (
        <ToggleGroupItem key={key} value={key} aria-label={label} title={label}>
          <Icon className="size-3.5" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
