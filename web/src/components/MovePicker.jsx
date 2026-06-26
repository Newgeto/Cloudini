import { useEffect, useState } from 'react'

import { api } from '../lib/api'
import { CloseIcon, FolderIcon, MoveIcon, Spinner } from './Icons'

// Sélecteur de dossier de destination (navigation interne) pour déplacer
// un fichier ou un dossier, façon « Déplacer vers… » de Google Drive.
export default function MovePicker({ title, excludeFolderId, onCancel, onMove }) {
  const [folderId, setFolderId] = useState(null)
  const [crumbs, setCrumbs] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      api.listFolders(folderId),
      folderId == null ? Promise.resolve([]) : api.folderBreadcrumb(folderId),
    ])
      .then(([f, c]) => {
        if (active) {
          setFolders(f)
          setCrumbs(c)
        }
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [folderId])

  // On masque le dossier déplacé lui-même (impossible de l'imbriquer dans soi-même).
  const selectable = folders.filter((f) => f.id !== excludeFolderId)

  async function confirmMove() {
    setMoving(true)
    try {
      await onMove(folderId)
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button aria-label="Annuler" onClick={onCancel} className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm" />
      <div className="relative flex max-h-[80vh] w-full max-w-md animate-scale-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition duration-200 hover:bg-slate-100">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap border-b border-slate-100 px-5 py-2 text-sm text-slate-500">
          <button onClick={() => setFolderId(null)} className="font-medium transition hover:text-indigo-600">
            Mon Drive
          </button>
          {crumbs.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <span className="text-slate-300">/</span>
              <button onClick={() => setFolderId(c.id)} className="max-w-[8rem] truncate transition hover:text-indigo-600">
                {c.name}
              </button>
            </span>
          ))}
        </div>

        <div className="min-h-[8rem] flex-1 overflow-auto p-2">
          {loading ? (
            <div className="flex justify-center py-10 text-indigo-600">
              <Spinner className="h-6 w-6" />
            </div>
          ) : selectable.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Aucun sous-dossier ici.</p>
          ) : (
            selectable.map((f) => (
              <button
                key={f.id}
                onClick={() => setFolderId(f.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition duration-200 hover:bg-slate-100"
              >
                <FolderIcon className="h-5 w-5 shrink-0 text-indigo-500" />
                <span className="truncate text-sm font-medium text-slate-700">{f.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-200/60">
            Annuler
          </button>
          <button
            onClick={confirmMove}
            disabled={moving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.97] disabled:opacity-50"
          >
            {moving ? <Spinner className="h-4 w-4" /> : <MoveIcon className="h-4 w-4" />}
            Déplacer ici
          </button>
        </div>
      </div>
    </div>
  )
}
