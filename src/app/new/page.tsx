import { EditForm } from '../edit-form'

export default function NewCompany() {
  return (
    <>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>Add a company</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        First-hand experience is welcome. A link is nice but not required.
      </p>
      <div className="card">
        <EditForm />
      </div>
    </>
  )
}
