// Cert + CertList components (Tasks 12-14)

export function Cert({ earned, id, name, provider, toggleCert, deleteCert }) {
  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={earned}
          onChange={e => toggleCert(id, e.target.checked)}
        />
        {name}
      </label>
      <span className="provider">{provider}</span>
      <button onClick={() => deleteCert(id)} className="btn btn-danger">
        Delete
      </button>
    </li>
  )
}

export function CertList({ certs, toggleCert, deleteCert }) {
  return (
    <ul className="list">
      {certs.length === 0 && "No certifications yet - add one above!"}
      {certs.map(cert => {
        return (
          <Cert
            {...cert}
            key={cert.id}
            toggleCert={toggleCert}
            deleteCert={deleteCert}
          />
        )
      })}
    </ul>
  )
}
