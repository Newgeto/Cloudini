import { useEffect, useState } from 'react'

import { api } from '../lib/api'
import { getFileKind } from '../lib/fileType'
import { visualFor } from './fileVisuals'
import { ClockIcon, DownloadIcon, Spinner } from './Icons'

// Format relatif court : « il y a 3 h », « hier », sinon date complète.
function formatRelative(value) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days} jours`
  return date.toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

// Page « Récents » : les derniers fichiers ajoutés, en liste chronologique.
export default function RecentPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api
      .listAllFiles()
      .then((list) => setFiles(list.slice(0, 20)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownload(file) {
    setBusyId(file.id)
    setError('')
    try {
      await api.downloadFile(file.id, file.filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-3xl animate-fade-in px-4 py-6 sm:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Récents</h1>
          <p className="mt-1 text-sm text-slate-500">Vos derniers fichiers ajoutés.</p>
        </div>

        {error && (
          <p className="mt-4 animate-fade-in rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-16 flex justify-center text-indigo-600">
            <Spinner className="h-8 w-8" />
          </div>
        ) : files.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ClockIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Aucune activité récente</p>
            <p className="mt-1 text-sm text-slate-500">Vos fichiers récents apparaîtront ici.</p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {files.map((file, index) => {
              const visual = visualFor(getFileKind(file.filename))
              const Icon = visual.Icon
              return (
              <li
                key={file.id}
                style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
                className="group flex animate-fade-in-up items-center gap-3 px-4 py-3 transition duration-200 hover:bg-indigo-50/40"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${visual.badge}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {formatRelative(file.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(file)}
                  disabled={busyId === file.id}
                  title="Télécharger"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 opacity-0 transition duration-200 hover:bg-slate-100 hover:text-indigo-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50 sm:opacity-0"
                >
                  {busyId === file.id ? <Spinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
                </button>
              </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
