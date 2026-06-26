import { useState } from 'react'

import { api } from '../lib/api'
import { fullName as getFullName, initials as getInitials } from '../lib/user'
import { useUI } from './ui/UIProvider'
import { AtIcon, CopyIcon, LockIcon, MailIcon, PhoneIcon, Spinner, UserIcon } from './Icons'

export default function ProfilePage({ user }) {
  const ui = useUI()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const name = getFullName(user)
  const initials = getInitials(user)

  async function copyId() {
    try {
      await navigator.clipboard.writeText(user.public_id)
      ui.toast.success('ID copié dans le presse-papiers.')
    } catch {
      ui.toast.error('Impossible de copier l’ID.')
    }
  }

  const infoRows = [
    { label: 'Prénom', value: user.first_name, icon: UserIcon },
    { label: 'Nom', value: user.last_name, icon: UserIcon },
    { label: "Nom d'utilisateur", value: `@${user.username}`, icon: AtIcon },
    { label: 'Email', value: user.email, icon: MailIcon },
    { label: 'Téléphone', value: user.phone, icon: PhoneIcon },
  ]

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Mot de passe mis à jour.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-5xl animate-fade-in px-4 py-6 sm:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Profil</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez les informations et la sécurité du compte.</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="animate-fade-in-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white shadow-sm shadow-indigo-600/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{name}</p>
                <p className="truncate text-sm text-slate-500">@{user.username}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-1">
              {infoRows.map((row) => {
                const Icon = row.icon
                return (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition duration-200 hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{row.label}</dt>
                      <dd className="truncate text-sm font-medium text-slate-800">{row.value || '—'}</dd>
                    </div>
                  </div>
                )
              })}
            </dl>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
              <span className="shrink-0 text-slate-500">ID du compte</span>
              <button
                onClick={copyId}
                title="Copier l'identifiant"
                className="group flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs text-slate-700 transition duration-200 hover:bg-slate-100"
              >
                <span className="truncate">{user.public_id}</span>
                <CopyIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-indigo-600" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Statut</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Actif
              </span>
            </div>
          </section>

          <section
            className="animate-fade-in-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            style={{ animationDelay: '80ms' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <LockIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Mot de passe</h2>
                <p className="text-sm text-slate-500">Utilisez au moins 8 caractères.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Mot de passe actuel</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nouveau mot de passe</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Confirmer le nouveau mot de passe</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>

              {error && <p className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {success && (
                <p className="animate-fade-in rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Spinner className="h-4 w-4" />}
                Mettre à jour
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
