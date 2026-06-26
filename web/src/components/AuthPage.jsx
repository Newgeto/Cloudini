import { useState } from 'react'

import { api } from '../lib/api'
import { CloudIcon, Spinner } from './Icons'

// Écran d'authentification : split plein écran (marque à gauche, formulaire à droite).
export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await api.register({
          first_name: firstName,
          last_name: lastName,
          username,
          phone,
          email,
          password,
        })
      }
      await api.login(email, password)
      const me = await api.me()
      onAuthenticated(me)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError('')
  }

  return (
    <div className="grid h-full lg:grid-cols-2">
      {/* Panneau de marque (masqué sur mobile) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
            <CloudIcon className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Cloudini</span>
        </div>

        <div className="relative text-white">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Vos fichiers, partout, en sécurité.
          </h1>
          <p className="mt-4 max-w-sm text-lg text-white/80">
            Stockez, retrouvez et téléchargez vos documents depuis n'importe quel appareil.
          </p>
        </div>

        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Cloudini</p>
      </div>

      {/* Panneau formulaire (pleine hauteur) */}
      <div className="flex h-full flex-col justify-center bg-slate-50 px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo visible sur mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <CloudIcon className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-slate-800">Cloudini</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {isRegister ? 'Créer un compte' : 'Bon retour 👋'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister ? 'Quelques secondes suffisent.' : 'Connectez-vous pour accéder à vos fichiers.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegister && (
              <div key="register-fields" className="animate-fade-in-up space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Marie"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nom d'utilisateur
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="marie.dupont"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Spinner className="h-5 w-5" />}
              {isRegister ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button onClick={switchMode} className="font-semibold text-indigo-600 hover:text-indigo-500">
              {isRegister ? 'Se connecter' : 'Créer un compte'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
