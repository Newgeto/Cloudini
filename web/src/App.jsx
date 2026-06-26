import { useEffect, useState } from 'react'

import AuthPage from './components/AuthPage'
import FilesPage from './components/FilesPage'
import Header from './components/Header'
import { Spinner } from './components/Icons'
import { api } from './lib/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Au démarrage, si un token existe, on valide la session.
  useEffect(() => {
    if (!api.getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then(setUser)
      .catch(() => api.logout())
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    api.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-indigo-500">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onAuthenticated={setUser} />
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <Header user={user} onLogout={handleLogout} />
      <FilesPage />
    </div>
  )
}
