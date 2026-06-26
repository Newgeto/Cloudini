import { useEffect, useRef, useState } from 'react'

import { api } from '../lib/api'
import { CloudIcon, DownloadIcon, FileIcon, GridIcon, Spinner, TrashIcon, UploadIcon } from './Icons'

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

// Page principale : upload, stats et grille des fichiers.
export default function FilesPage({ searchQuery = '', uploadSignal = 0 }) {
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

  useEffect(() => {
    if (uploadSignal > 0) inputRef.current?.click()
  }, [uploadSignal])

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

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const visibleFiles = normalizedSearch
    ? files.filter((file) => file.filename.toLowerCase().includes(normalizedSearch))
    : files

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Mes fichiers</h1>
            <p className="mt-1 text-sm text-slate-500">
              {files.length} fichier{files.length > 1 ? 's' : ''} stocké{files.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <GridIcon className="h-4 w-4 text-sky-600" />
            Vue grille
          </div>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-9 text-center transition ${
            dragging
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-300 bg-white hover:border-sky-400 hover:bg-slate-50'
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-600 text-white">
            {uploading ? <Spinner className="h-6 w-6" /> : <UploadIcon className="h-6 w-6" />}
          </div>
          <p className="mt-3 font-semibold text-slate-800">
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
          <div className="mt-16 flex justify-center text-sky-600">
            <Spinner className="h-8 w-8" />
          </div>
        ) : files.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <CloudIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Aucun fichier pour l'instant</p>
            <p className="mt-1 text-sm text-slate-500">Envoyez votre premier fichier ci-dessus.</p>
          </div>
        ) : visibleFiles.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <FileIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Aucun resultat</p>
            <p className="mt-1 text-sm text-slate-500">Essayez avec un autre nom de fichier.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleFiles.map((file) => (
              <div
                key={file.id}
                className="group flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
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
