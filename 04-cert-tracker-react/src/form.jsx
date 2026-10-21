// Form to add a new certification (Task 17)
import { useState } from "react"

function CertForm({ onSubmit }) {
  const [newCert, setNewCert] = useState("")
  const [provider, setProvider] = useState("CompTIA")

  function handleSubmit(e) {
    e.preventDefault()
    if (newCert === "") return
    onSubmit(newCert, provider)
    setNewCert("")
  }

  return (
    <form onSubmit={handleSubmit} className="new-item-form">
      <div className="form-row">
        <label htmlFor="item">New Certification</label>
        <input
          value={newCert}
          onChange={e => setNewCert(e.target.value)}
          type="text"
          id="item"
          placeholder="e.g. Security+"
        />
      </div>
      <div className="form-row">
        <label htmlFor="provider">Provider</label>
        <select
          id="provider"
          value={provider}
          onChange={e => setProvider(e.target.value)}
        >
          <option>CompTIA</option>
          <option>ISC2</option>
          <option>ISACA</option>
          <option>EC-Council</option>
          <option>GIAC</option>
          <option>OffSec</option>
          <option>Cisco</option>
          <option>Microsoft</option>
          <option>AWS</option>
        </select>
      </div>
      <button className="btn">Add</button>
    </form>
  )
}

export { CertForm };
