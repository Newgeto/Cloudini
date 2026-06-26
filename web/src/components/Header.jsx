import { ChevronDownIcon, LogoutIcon, PlusIcon, SearchIcon, UserIcon } from './Icons'

// Barre supérieure de l'application : recherche, upload rapide et menu profil.
export default function Header({
  user,
  activeView,
  searchQuery,
  onSearchChange,
  onUpload,
  onShowProfile,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="min-w-0 flex-1">
        {activeView === 'files' ? (
          <label className="relative block max-w-xl">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher dans vos fichiers"
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            />
          </label>
        ) : (
          <div>
            <p className="text-sm font-medium text-slate-500">Espace personnel</p>
            <h1 className="truncate text-lg font-semibold text-slate-950">Parametres du compte</h1>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {activeView === 'files' && (
          <button
            onClick={onUpload}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Importer</span>
          </button>
        )}
        <button
          onClick={onShowProfile}
          className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <UserIcon className="h-4 w-4" />
          </span>
          <span className="max-w-36 truncate">{user.email}</span>
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </button>
        <button
          onClick={onLogout}
          title="Deconnexion"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
