'use client'

import { useEffect } from 'react'

/**
 * Browsers restore a page from the back/forward cache exactly as it was left, so
 * after an edit or revert on another page the list shows the old policy. Reload
 * whenever a page is restored rather than loaded.
 */
export function FreshOnReturn() {
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])
  return null
}
