import { useEffect, useState } from 'react'

import { api } from '../lib/api'
import { getFileKind } from '../lib/fileType'
import { useUI } from './ui/UIProvider'
import { FolderIcon, RefreshIcon, Spinner, TrashIcon } from './Icons'
import { visualFor } from './fileVisuals'

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

// Page « Corbeille » : dossiers et fichiers supprimés, restaurables ou définitifs.
export default function TrashPage() {
  const ui = useUI()
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyKey, setBusyKey] = useState(null)

  async function refresh() {
    setError('')
    try {
      const [trashFolders, trashFiles] = await Promise.all([
        api.listTrashFolders(),
        api.listTrash(),
      ])
      setFolders(trashFolders)
      setFiles(trashFiles)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function restore(kind, item) {
    setBusyKey(`${kind}-${item.id}`)
    try {
      if (kind === 'folder') {
        await api.restoreFolder(item.id)
        setFolders((prev) => prev.filter((f) => f.id !== item.id))
      } else {
        await api.restoreFile(item.id)
        setFiles((prev) => prev.filter((f) => f.id !== item.id))
      }
      ui.toast.success('Restauré.')
    } catch (err) {
      ui.toast.error(err.message)
    } finally {
      setBusyKey(null)
    }
  }

  async function deleteForever(kind, item) {
    const label = kind === 'folder' ? item.name : item.filename
    const ok = await ui.confirm({
      title: `Supprimer définitivement « ${label} » ?`,
      message:
        kind === 'folder'
          ? 'Le dossier et tout son contenu seront effacés. Cette action est irréversible.'
          : 'Ce fichier sera effacé définitivement. Cette action est irréversible.',
      confirmLabel: 'Supprimer définitivement',
      danger: true,
    })
    if (!ok) return
    setBusyKey(`${kind}-${item.id}`)
    try {
      if (kind === 'folder') {
        await api.deleteFolderPermanent(item.id)
        setFolders((prev) => prev.filter((f) => f.id !== item.id))
      } else {
        await api.deleteFilePermanent(item.id)
        setFiles((prev) => prev.filter((f) => f.id !== item.id))
      }
      ui.toast.success('Supprimé définitivement.')
    } catch (err) {
      ui.toast.error(err.message)
    } finally {
      setBusyKey(null)
    }
  }

  const isEmpty = folders.length === 0 && files.length === 0

  function row(kind, item) {
    const key = `${kind}-${item.id}`
    const busy = busyKey === key
    const isFolder = kind === 'folder'
    const visual = isFolder ? null : visualFor(getFileKind(item.filename))
    const Icon = isFolder ? FolderIcon : visual.Icon
    const name = isFolder ? item.name : item.filename
    const badge = isFolder ? 'bg-indigo-50 text-indigo-600' : visual.badge

    return (
      <li
        key={key}
        className="flex animate-fade-in-up flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:shadow-md"
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${badge}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-800" title={name}>
            {name}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {isFolder ? 'Dossier' : 'Fichier'} · supprimé le {formatDate(item.deleted_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => restore(kind, item)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition duration-200 hover:bg-indigo-100 disabled:opacity-50"
          >
            {busy ? <Spinner className="h-4 w-4" /> : <RefreshIcon className="h-4 w-4" />}
            Restaurer
          </button>
          <button
            onClick={() => deleteForever(kind, item)}
            disabled={busy}
            title="Supprimer définitivement"
            className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition duration-200 hover:bg-red-100 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </li>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-4xl animate-fade-in px-4 py-6 sm:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Corbeille</h1>
          <p className="mt-1 text-sm text-slate-500">Restaurez vos éléments ou supprimez-les définitivement.</p>
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
        ) : isEmpty ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <TrashIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">La corbeille est vide</p>
            <p className="mt-1 text-sm text-slate-500">Les éléments supprimés apparaîtront ici.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {folders.map((folder) => row('folder', folder))}
            {files.map((file) => row('file', file))}
          </ul>
        )}
      </div>
    </main>
  )
}
