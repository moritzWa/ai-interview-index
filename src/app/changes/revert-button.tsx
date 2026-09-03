'use client'

import { useState } from 'react'

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
      <button className="link" type="button" onClick={revert} disabled={busy}>
        {busy ? 'reverting…' : 'revert'}
      </button>
      {error && <span className="err small">{error}</span>}
    </>
  )
}
