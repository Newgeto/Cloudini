import { CloudIcon, LogoutIcon } from './Icons'

// Barre supérieure de l'application (sticky, pleine largeur).
export default function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <CloudIcon className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-800">Cloudini</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LogoutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  )
}
