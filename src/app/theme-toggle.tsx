'use client'

import { useEffect, useState } from 'react'

type Choice = 'system' | 'light' | 'dark'

const KEY = 'aii-theme'

/** Applied to <html> so CSS can override the prefers-color-scheme default. */
function apply(choice: Choice) {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
}

const Monitor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

const OPTIONS: { key: Choice; label: string; Icon: () => React.JSX.Element }[] = [
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

  function pick(next: Choice) {
    setChoice(next)
    apply(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Preference just won't persist. Not worth surfacing.
    }
  }

  return (
    <div className="themes" role="group" aria-label="Colour theme">
      {OPTIONS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={choice === key}
          onClick={() => pick(key)}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
