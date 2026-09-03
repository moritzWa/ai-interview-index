import { EditForm } from '../edit-form'

export default function NewCompany() {
  return (
    <>
      <h2 className="page">Add a company</h2>
      <p className="quiet small" style={{ marginTop: 0 }}>
        First-hand experience is welcome. A link is nice but not required.
      </p>
      <div className="card">
        <EditForm />
      </div>
    </>
  )
}
