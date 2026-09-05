import type { Metadata } from 'next'
import './globals.css'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeToggle } from './theme-toggle'
import { SITE_URL } from '@/lib/site'

/** Emoji favicon, inlined as SVG so there is no binary asset to keep in sync. */
const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦾</text></svg>',
  )

const DESCRIPTION =
  'Which companies let you use AI in their coding interviews, which ban it, and which built the interview around it. A public, editable index with sources.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Interview Index: which companies allow AI in coding interviews',
    template: '%s — AI Interview Index',
  },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  icons: { icon: FAVICON },
  openGraph: {
    type: 'website',
    siteName: 'AI Interview Index',
    title: 'Which companies allow AI in coding interviews',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: 'summary', title: 'AI Interview Index', description: DESCRIPTION },
}

/**
 * Runs before first paint so a saved light/dark choice does not flash the system
 * theme first. Inline and tiny on purpose; anything async is too late.
 */
const NO_FLASH = `try{var t=localStorage.getItem('aii-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="text-[13px] leading-relaxed antialiased">
        <TooltipProvider delayDuration={300}>
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-24">
          <header className="mb-7 flex items-start gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="mb-1 text-lg font-semibold tracking-tight">
                <a href="/">AI Interview Index</a>
              </h1>
              <p className="max-w-[62ch] text-muted-foreground">
                Which companies let you use AI in their coding interviews, which ban it, and which
                built the interview around it. Anyone can edit; every change is public and
                revertible.
              </p>
            </div>
            <nav className="flex shrink-0 items-center gap-4">
              <a
                href="/changes"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Recent changes
              </a>
              <Button asChild size="sm">
                <a href="/new">Submit a company</a>
              </Button>
            </nav>
          </header>

          <p className="mb-4 text-xs text-faint">
            Companion to{' '}
            <a
              className="underline underline-offset-2 transition-colors hover:text-foreground"
              href="https://scalingknowledge.substack.com"
              target="_blank"
              rel="noreferrer"
            >
              Coding Interviews Should Allow AI
            </a>{' '}
            on Scaling Knowledge.
          </p>

          {children}

          <footer className="mt-12 flex items-center gap-4 border-t pt-5 text-xs text-muted-foreground">
            <span className="flex-1">
              Built by{' '}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://moritzw.com"
                target="_blank"
                rel="noreferrer"
              >
                Moritz Wallawitsch
              </a>
            </span>
            <ThemeToggle />
          </footer>
        </div>
        </TooltipProvider>
      </body>
    </html>
  )
}
