'use client'

/**
 * One invisible Turnstile widget for the whole page, shared by the submit form and
 * the inline policy toggles. Tokens are single-use, so every call runs the widget
 * again rather than handing back the previous one.
 *
 * Resolves to null when no site key is configured, which is how local development
 * and any fork without Cloudflare keys keep working.
 */

type Turnstile = {
  render: (el: Element, o: Record<string, unknown>) => string
  execute: (id: string) => void
  reset: (id: string) => void
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

let widgetId: string | null = null
let scriptLoading: Promise<void> | null = null
let pending: ((token: string | null) => void) | null = null

function loadScript(): Promise<void> {
  if (scriptLoading) return scriptLoading
  scriptLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(s)
  })
  return scriptLoading
}

function api(): Turnstile | undefined {
  return (window as unknown as { turnstile?: Turnstile }).turnstile
}

export async function getTurnstileToken(): Promise<string | null> {
  if (!SITE_KEY) return null

  try {
    await loadScript()
  } catch {
    // Cloudflare unreachable or blocked by an extension. The server decides what to
    // do with a missing token; the UI should not dead-end here.
    return null
  }

  const t = api()
  if (!t) return null

  return new Promise((resolve) => {
    pending = resolve

    if (widgetId === null) {
      const host = document.createElement('div')
      host.style.display = 'none'
      document.body.appendChild(host)
      widgetId = t.render(host, {
        sitekey: SITE_KEY,
        execution: 'execute',
        appearance: 'execute',
        callback: (token: string) => {
          pending?.(token)
          pending = null
        },
        'error-callback': () => {
          pending?.(null)
          pending = null
        },
        'timeout-callback': () => {
          pending?.(null)
          pending = null
        },
      })
    } else {
      t.reset(widgetId)
    }

    t.execute(widgetId!)

    // Never leave a click hanging on a challenge that stalls.
    setTimeout(() => {
      if (pending === resolve) {
        pending = null
        resolve(null)
      }
    }, 12000)
  })
}
