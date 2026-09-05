'use client'

import { useState } from 'react'
import type { Company, Revision } from '@/db/schema'
import { parseResources } from '@/lib/companies'
import { when } from '@/lib/time'
import { Button } from '@/components/ui/button'
import { EditForm } from '../../edit-form'
import { RevertButton } from '../../changes/revert-button'

export function CompanyDetail({ company, history }: { company: Company; history: Revision[] }) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <div className="mt-10">
        {editing ? (
          <div className="rounded-xl border bg-card p-5">
            <EditForm
              initial={{
                id: company.id,
                name: company.name,
                policy: company.policy,
                process: company.process,
                sourceUrl: company.sourceUrl ?? '',
                sourceNote: company.sourceNote ?? '',
                website: company.website ?? '',
                city: company.city ?? '',
                industry: company.industry ?? '',
                resources: parseResources(company.resources),
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-muted-foreground"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit this entry</Button>
        )}
      </div>

      <section className="mt-10">
        <h3 className="mb-3 text-[11px] font-medium tracking-widest text-faint uppercase">
          History
        </h3>
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {history.map((r) => (
            <div key={r.id} className="flex items-baseline gap-3 px-4 py-2.5 text-xs">
              <span className="w-14 shrink-0 text-faint">{when(r.createdAt)}</span>
              <span className="flex-1 text-muted-foreground">{r.summary}</span>
              {r.before && <RevertButton revisionId={r.id} />}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
