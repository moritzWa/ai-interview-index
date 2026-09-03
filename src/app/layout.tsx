import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Interview Index',
  description:
    'Which companies let you use AI in their coding interviews, which ban it, and which built the interview around it.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
        </div>
      </body>
    </html>
  )
}
