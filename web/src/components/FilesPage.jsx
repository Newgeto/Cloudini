import { useEffect, useRef, useState } from 'react'

import { api } from '../lib/api'
import { CloudIcon, DownloadIcon, FileIcon, Spinner, TrashIcon, UploadIcon } from './Icons'

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

// Page principale : zone d'upload + grille des fichiers (pleine largeur).
export default function FilesPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const inputRef = useRef(null)

  async function refresh() {
    setError('')
    try {
      setFiles(await api.listFiles())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleFiles(fileList) {
    const selected = Array.from(fileList)
    if (selected.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of selected) {
        await api.uploadFile(file)
      }
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

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

  async function handleDelete(file) {
    setBusyId(file.id)
    setError('')
    try {
      await api.deleteFile(file.id)
      setFiles((prev) => prev.filter((f) => f.id !== file.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mes fichiers</h1>
            <p className="mt-1 text-sm text-slate-500">
              {files.length} fichier{files.length > 1 ? 's' : ''} stocké{files.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Zone d'upload drag & drop */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
            dragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            {uploading ? <Spinner className="h-6 w-6" /> : <UploadIcon className="h-6 w-6" />}
          </div>
          <p className="mt-4 font-semibold text-slate-800">
            {uploading ? 'Envoi en cours…' : 'Glissez vos fichiers ici'}
          </p>
          <p className="mt-1 text-sm text-slate-500">ou cliquez pour parcourir</p>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Contenu : chargement / vide / grille */}
        {loading ? (
          <div className="mt-16 flex justify-center text-indigo-500">
            <Spinner className="h-8 w-8" />
          </div>
        ) : files.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CloudIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Aucun fichier pour l'instant</p>
            <p className="mt-1 text-sm text-slate-500">Envoyez votre premier fichier ci-dessus.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatDate(file.created_at)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={busyId === file.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    {busyId === file.id ? <Spinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
                    Télécharger
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={busyId === file.id}
                    title="Supprimer"
                    className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
