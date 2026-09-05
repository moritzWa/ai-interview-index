'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function RevertButton({ revisionId }: { revisionId: number }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function revert() {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/revert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ revisionId }),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(json.error ?? 'Revert failed.')
      setBusy(false)
      return
    }
    window.location.reload()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={revert}
        disabled={busy}
      >
        {busy ? 'reverting…' : 'revert'}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </>
  )
}
