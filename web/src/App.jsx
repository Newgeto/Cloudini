import { useEffect, useState } from 'react'

import AuthPage from './components/AuthPage'
import FilesPage from './components/FilesPage'
import Header from './components/Header'
import { CloudIcon, FileIcon, GridIcon, MenuIcon, Spinner, UserIcon } from './components/Icons'
import ProfilePage from './components/ProfilePage'
import { api } from './lib/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('files')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadSignal, setUploadSignal] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    setActiveView('files')
    setSearchQuery('')
  }

  function openView(view) {
    setActiveView(view)
    setSidebarOpen(false)
  }

  function requestUpload() {
    setActiveView('files')
    setUploadSignal((value) => value + 1)
  }

  const navItems = [
    { id: 'files', label: 'Tous les fichiers', icon: FileIcon },
    { id: 'activity', label: 'Activite', icon: GridIcon, disabled: true },
    { id: 'profile', label: 'Profil', icon: UserIcon },
  ]

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white">
          <CloudIcon className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-950">Cloudini</span>
      </div>

      <div className="flex-1 px-3 py-4">
        <button
          onClick={requestUpload}
          className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-500"
        >
          <CloudIcon className="h-4 w-4" />
          Nouveau fichier
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && openView(item.id)}
                disabled={item.disabled}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => openView('profile')}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <UserIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-800">{user?.email}</span>
            <span className="block text-xs text-slate-500">Compte personnel</span>
          </span>
        </button>
      </div>
    </aside>
  )

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
    <div className="flex h-full bg-slate-50">
      <div className="hidden lg:block">{sidebar}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-slate-950/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
              <CloudIcon className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-950">Cloudini</span>
          </div>
        </div>

        <Header
          user={user}
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUpload={requestUpload}
          onShowProfile={() => openView('profile')}
          onLogout={handleLogout}
        />
        {activeView === 'profile' ? (
          <ProfilePage user={user} />
        ) : (
          <FilesPage searchQuery={searchQuery} uploadSignal={uploadSignal} />
        )}
      </div>
    </div>
  )
}
