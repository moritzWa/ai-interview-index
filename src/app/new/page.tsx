import { EditForm } from '../edit-form'

export default function NewCompany() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-base font-semibold tracking-tight">Add a company</h2>
      <p className="mt-1 mb-5 text-xs text-faint">
        First-hand experience is welcome. A link is nice but not required.
      </p>
      <div className="rounded-xl border bg-card p-5">
        <EditForm />
      </div>
    </div>
  )
}
