'use client'

import { useState } from 'react'
import type { Company, Revision } from '@/db/schema'
import { EditForm } from '../../edit-form'
import { when } from '@/lib/time'
import { RevertButton } from '../../changes/revert-button'

export function CompanyDetail({ company, history }: { company: Company; history: Revision[] }) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      {editing ? (
        <div className="card" style={{ marginTop: 24 }}>
          <EditForm
            initial={{
              id: company.id,
              name: company.name,
              policy: company.policy,
              process: company.process,
              sourceUrl: company.sourceUrl ?? '',
              sourceNote: company.sourceNote ?? '',
              city: company.city ?? '',
              industry: company.industry ?? '',
            }}
          />
          <p style={{ marginBottom: 0 }}>
            <button className="link" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </p>
        </div>
      ) : (
        <button className="primary" type="button" onClick={() => setEditing(true)}>
          Edit this entry
        </button>
      )}

      <h3 className="group-head">History</h3>
      <div>
        {history.map((r) => (
          <div className="change" key={r.id}>
            <span className="when">{when(r.createdAt)}</span>
            <span className="small" style={{ flex: 1 }}>
              {r.summary}
            </span>
            {r.before && <RevertButton revisionId={r.id} />}
          </div>
        ))}
      </div>
    </>
  )
}
