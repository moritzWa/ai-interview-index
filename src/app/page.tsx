import { asc } from 'drizzle-orm'
import { companies, db } from '@/db'
import { CompanyList } from './company-list'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const all = await db.select().from(companies).orderBy(asc(companies.name))

  return (
    <>
      <CompanyList companies={all} />

      <div className="footer-cta">
        <p>
          Interviewed somewhere that is not listed, or spotted something wrong? Every field is
          editable and no account is needed.
        </p>
        <a className="btn" href="/new">
          Submit a company
        </a>
      </div>
    </>
  )
}
