import { useState } from 'react'

import { api } from '../lib/api'
import { LockIcon, Spinner, UserIcon } from './Icons'

export default function ProfilePage({ user }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Profil</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez les informations et la sécurité du compte.</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{user.email}</p>
                <p className="text-sm text-slate-500">Compte Cloudini</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-500">Identifiant</span>
                <span className="font-medium text-slate-800">#{user.id}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-500">Statut</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Actif
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>

              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {success && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Spinner className="h-4 w-4" />}
                Mettre a jour
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
