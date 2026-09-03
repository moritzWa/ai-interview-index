import type { Metadata } from 'next'
import './globals.css'
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
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <div className="wrap">
          <header className="site">
            <div className="who">
              <h1>
                <a href="/">AI Interview Index</a>
              </h1>
              <p>
                Which companies let you use AI in their coding interviews, which ban it, and which
                built the interview around it. Anyone can edit; every change is public and
                revertible.
              </p>
            </div>
            <nav className="site">
              <a href="/changes">Recent changes</a>
              <a className="btn" href="/new">
                Submit a company
              </a>
            </nav>
          </header>

          <p className="masthead">
            Companion to{' '}
            <a href="https://scalingknowledge.substack.com" target="_blank" rel="noreferrer">
              Coding Interviews Should Allow AI
            </a>{' '}
            on Scaling Knowledge.
          </p>

          {children}

          <footer className="site">
            <span className="by">
              Built by{' '}
              <a href="https://moritzw.com" target="_blank" rel="noreferrer">
                Moritz Wallawitsch
              </a>
            </span>
            <ThemeToggle />
          </footer>
        </div>
      </body>
    </html>
  )
}
