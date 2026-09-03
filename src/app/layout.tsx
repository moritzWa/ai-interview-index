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
            <h1>
              <a href="/" style={{ textDecoration: 'none' }}>
                AI Interview Index
              </a>
            </h1>
            <p>
              Which companies let you use AI in their coding interviews, which ban it, and which
              built the interview around it. Anyone can edit; every change is public and revertible.
            </p>
            <nav className="site">
              <a href="/">Companies</a>
              <a href="/changes">Recent changes</a>
              <a className="cta" href="/new">
                Submit a company
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
