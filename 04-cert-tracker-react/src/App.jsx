import { useState, useEffect } from 'react'
import { App2, MovieList, MovieListItem, Title } from './listing11.2.jsx'
import { CertList, Cert } from './cert.jsx'
import { CertForm } from './form.jsx'

function App() {
  // list of certs - loads from localStorage so it survives a refresh
  const [certs, setCerts] = useState(() => {
    const localValue = localStorage.getItem("CERTS")
    if (localValue == null) return []

    return JSON.parse(localValue)
  })

  // save to localStorage every time the list changes
  useEffect(() => {
    localStorage.setItem("CERTS", JSON.stringify(certs))
  }, [certs])

  // CREATE
  function addCert(name, provider) {
    setCerts(currentCerts => {
      return [
        ...currentCerts,
        { id: crypto.randomUUID(), name, provider, earned: false },
      ]
    })
  }

  // UPDATE - check/uncheck "earned"
  function toggleCert(id, earned) {
    setCerts(currentCerts => {
      return currentCerts.map(cert => {
        if (cert.id === id) {
          return { ...cert, earned }
        }
        return cert
      })
    })
  }

  // DELETE
  function deleteCert(id) {
    setCerts(currentCerts => {
      return currentCerts.filter(cert => cert.id !== id)
    })
  }

  const earnedCount = certs.filter(cert => cert.earned).length

  return (
    <div>
      <h1 className="app-title">🔐 Cybersecurity Cert Tracker</h1>
      <p className="app-subtitle">Built by Anthony (AJ) Bayate</p>

      <App2 />

      <CertForm onSubmit={addCert} />
      <h1 className="header">My Certification Roadmap</h1>
      <p className="progress">
        {earnedCount} of {certs.length} earned
      </p>
      <CertList certs={certs} toggleCert={toggleCert} deleteCert={deleteCert} />
    </div>
  )
}

export default App
