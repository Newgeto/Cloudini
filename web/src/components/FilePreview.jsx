import { useEffect, useState } from 'react'

import { api } from '../lib/api'
import { getFileKind, isPreviewable } from '../lib/fileType'
import { CloseIcon, DownloadIcon, Spinner } from './Icons'
import { visualFor } from './fileVisuals'

// Modale d'aperçu : affiche le contenu du fichier sans téléchargement préalable.
export default function FilePreview({ file, onClose, onDownload }) {
  const kind = getFileKind(file.filename)
  const previewable = isPreviewable(kind)
  const [state, setState] = useState({ loading: previewable, url: null, text: null, error: '' })

  // Fermeture au clavier (Échap).
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Récupère le contenu (blob authentifié) une fois.
  useEffect(() => {
    if (!previewable) return undefined
    let active = true
    let created
    api
      .fileObjectUrl(file.id)
      .then(async (res) => {
        if (!active) {
          URL.revokeObjectURL(res.url)
          return
        }
        created = res.url
        const text = kind === 'text' ? await res.blob.text() : null
        setState({ loading: false, url: res.url, text, error: '' })
      })
      .catch((err) => active && setState({ loading: false, url: null, text: null, error: err.message }))
    return () => {
      active = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [file.id, kind, previewable])

  const visual = visualFor(kind)
  const Icon = visual.Icon

  function renderBody() {
    if (!previewable) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${visual.badge}`}>
            <Icon className="h-10 w-10" />
          </div>
          <p className="font-semibold text-slate-700">Aperçu indisponible pour ce type de fichier</p>
          <p className="text-sm text-slate-500">Téléchargez-le pour l'ouvrir sur votre appareil.</p>
        </div>
      )
    }
    if (state.loading) {
      return (
        <div className="flex items-center justify-center py-24 text-indigo-600">
          <Spinner className="h-8 w-8" />
        </div>
      )
    }
    if (state.error) {
      return (
        <div className="px-6 py-16 text-center text-sm text-red-600">{state.error}</div>
      )
    }
    if (kind === 'image') {
      return <img src={state.url} alt={file.filename} className="mx-auto max-h-[70vh] w-auto object-contain" />
    }
    if (kind === 'pdf') {
      return <iframe src={state.url} title={file.filename} className="h-[70vh] w-full bg-white" />
    }
    if (kind === 'video') {
      return <video src={state.url} controls className="mx-auto max-h-[70vh] w-full bg-black" />
    }
    if (kind === 'audio') {
      return (
        <div className="px-6 py-16">
          <audio src={state.url} controls className="w-full" />
        </div>
      )
    }
    if (kind === 'text') {
      return (
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words bg-slate-50 px-5 py-4 text-sm text-slate-800">
          {state.text}
        </pre>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 animate-fade-in bg-slate-950/60 backdrop-blur-sm" />

      <div className="relative flex max-h-[90vh] w-full max-w-4xl animate-scale-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${visual.badge}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900" title={file.filename}>
              {file.filename}
            </p>
            <p className="text-xs text-slate-400">{visual.label}</p>
          </div>
          <button
            onClick={() => onDownload(file)}
            title="Télécharger"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition duration-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            title="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-900"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-50/50">{renderBody()}</div>
      </div>
    </div>
  )
}
