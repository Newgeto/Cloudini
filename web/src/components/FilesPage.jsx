import { useCallback, useEffect, useRef, useState } from 'react'

import { api } from '../lib/api'
import { useUI } from './ui/UIProvider'
import CardMenu from './CardMenu'
import FilePreview from './FilePreview'
import FileThumb from './FileThumb'
import MovePicker from './MovePicker'
import {
  CloudIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
  FolderPlusIcon,
  MoveIcon,
  PencilIcon,
  Spinner,
  TrashIcon,
  UploadIcon,
} from './Icons'

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

// Navigateur de fichiers façon Drive : dossiers, sous-dossiers, upload, aperçu.
export default function FilesPage({ searchQuery = '', uploadSignal = 0 }) {
  const ui = useUI()
  const [folderId, setFolderId] = useState(null) // null = racine
  const [crumbs, setCrumbs] = useState([])
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [moving, setMoving] = useState(null) // { kind:'file'|'folder', item }
  const inputRef = useRef(null)

  const load = useCallback(async (id) => {
    setError('')
    try {
      const [subFolders, fileList, breadcrumb] = await Promise.all([
        api.listFolders(id),
        api.listFiles(id),
        id == null ? Promise.resolve([]) : api.folderBreadcrumb(id),
      ])
      setFolders(subFolders)
      setFiles(fileList)
      setCrumbs(breadcrumb)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(folderId)
  }, [folderId, load])

  useEffect(() => {
    if (uploadSignal > 0) inputRef.current?.click()
  }, [uploadSignal])

  function openFolder(id) {
    setLoading(true)
    setFolderId(id)
  }

  async function handleFiles(fileList) {
    const selected = Array.from(fileList)
    if (selected.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of selected) {
        await api.uploadFile(file, folderId)
      }
      await load(folderId)
      ui.toast.success(`${selected.length} fichier${selected.length > 1 ? 's' : ''} importé${selected.length > 1 ? 's' : ''}.`)
    } catch (err) {
      ui.toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  async function createFolder() {
    const name = await ui.prompt({
      title: 'Nouveau dossier',
      placeholder: 'Nom du dossier',
      confirmLabel: 'Créer',
    })
    if (!name) return
    try {
      await api.createFolder(name, folderId)
      await load(folderId)
      ui.toast.success('Dossier créé.')
    } catch (err) {
      ui.toast.error(err.message)
    }
  }

  async function renameItem(kind, item) {
    const current = kind === 'file' ? item.filename : item.name
    const name = await ui.prompt({
      title: kind === 'file' ? 'Renommer le fichier' : 'Renommer le dossier',
      defaultValue: current,
      confirmLabel: 'Renommer',
    })
    if (!name || name === current) return
    try {
      if (kind === 'file') await api.renameFile(item.id, name)
      else await api.renameFolder(item.id, name)
      await load(folderId)
      ui.toast.success('Renommé.')
    } catch (err) {
      ui.toast.error(err.message)
    }
  }

  async function performMove(destination) {
    const { kind, item } = moving
    try {
      if (kind === 'file') await api.moveFile(item.id, destination)
      else await api.moveFolder(item.id, destination)
      setMoving(null)
      await load(folderId)
      ui.toast.success('Déplacé.')
    } catch (err) {
      ui.toast.error(err.message)
    }
  }

  async function trashFile(file) {
    setBusyId(file.id)
    setError('')
    try {
      await api.deleteFile(file.id)
      setFiles((prev) => prev.filter((f) => f.id !== file.id))
      ui.toast.success('Fichier déplacé vers la corbeille.')
    } catch (err) {
      ui.toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function trashFolder(folder) {
    const ok = await ui.confirm({
      title: `Supprimer « ${folder.name} » ?`,
      message: 'Le dossier et tout son contenu seront placés dans la corbeille.',
      confirmLabel: 'Mettre à la corbeille',
      danger: true,
    })
    if (!ok) return
    try {
      await api.deleteFolder(folder.id)
      setFolders((prev) => prev.filter((f) => f.id !== folder.id))
      ui.toast.success('Dossier déplacé vers la corbeille.')
    } catch (err) {
      ui.toast.error(err.message)
    }
  }

  async function handleDownload(file) {
    setBusyId(file.id)
    try {
      await api.downloadFile(file.id, file.filename)
    } catch (err) {
      ui.toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const search = searchQuery.trim().toLowerCase()
  const visibleFolders = search ? folders.filter((f) => f.name.toLowerCase().includes(search)) : folders
  const visibleFiles = search ? files.filter((f) => f.filename.toLowerCase().includes(search)) : files
  const isEmpty = folders.length === 0 && files.length === 0
  const noResults = !isEmpty && visibleFolders.length === 0 && visibleFiles.length === 0

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl animate-fade-in px-4 py-6 sm:px-8">
        {/* Fil d'Ariane + action « Nouveau dossier » */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 flex-wrap items-center gap-1 text-lg font-bold tracking-tight text-slate-950">
            <button onClick={() => openFolder(null)} className="transition duration-200 hover:text-indigo-600">
              Mon Drive
            </button>
            {crumbs.map((c, i) => (
              <span key={c.id} className="flex min-w-0 items-center gap-1">
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => openFolder(c.id)}
                  className={`max-w-[12rem] truncate transition duration-200 hover:text-indigo-600 ${
                    i === crumbs.length - 1 ? 'text-slate-950' : 'text-slate-500'
                  }`}
                >
                  {c.name}
                </button>
              </span>
            ))}
          </nav>

          <button
            onClick={createFolder}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.97]"
          >
            <FolderPlusIcon className="h-4 w-4" />
            Nouveau dossier
          </button>
        </div>

        {/* Zone d'upload (dépose dans le dossier courant) */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-5 text-center transition duration-200 ${
            dragging
              ? 'scale-[1.01] border-indigo-500 bg-indigo-50'
              : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-600/20">
            {uploading ? <Spinner className="h-5 w-5" /> : <UploadIcon className="h-5 w-5" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">
              {uploading ? 'Envoi en cours…' : 'Glissez vos fichiers ici'}
            </p>
            <p className="text-xs text-slate-500">ou cliquez pour parcourir — déposés dans ce dossier</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
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
              <CloudIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Ce dossier est vide</p>
            <p className="mt-1 text-sm text-slate-500">Importez un fichier ou créez un dossier.</p>
          </div>
        ) : noResults ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <FileIcon className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Aucun résultat</p>
            <p className="mt-1 text-sm text-slate-500">Essayez avec un autre nom.</p>
          </div>
        ) : (
          <>
            {/* Dossiers */}
            {visibleFolders.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Dossiers</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleFolders.map((folder, index) => (
                    <div
                      key={folder.id}
                      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                      className="group flex animate-fade-in-up items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <button
                        onClick={() => openFolder(folder.id)}
                        onDoubleClick={() => openFolder(folder.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-105">
                          <FolderIcon className="h-5 w-5" />
                        </span>
                        <span className="truncate text-sm font-medium text-slate-800" title={folder.name}>
                          {folder.name}
                        </span>
                      </button>
                      <CardMenu
                        items={[
                          { label: 'Renommer', icon: PencilIcon, onClick: () => renameItem('folder', folder) },
                          { label: 'Déplacer vers…', icon: MoveIcon, onClick: () => setMoving({ kind: 'folder', item: folder }) },
                          { label: 'Mettre à la corbeille', icon: TrashIcon, danger: true, onClick: () => trashFolder(folder) },
                        ]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fichiers */}
            {visibleFiles.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Fichiers</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleFiles.map((file, index) => (
                    <div
                      key={file.id}
                      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                      className="group flex animate-fade-in-up flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-600/5"
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        title={`Aperçu de ${file.filename}`}
                        className="relative block aspect-[4/3] overflow-hidden bg-slate-50"
                      >
                        <span className="block h-full w-full transition-transform duration-300 group-hover:scale-[1.04]">
                          <FileThumb file={file} />
                        </span>
                        <span className="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-200 group-hover:bg-slate-950/5" />
                      </button>

                      <div className="flex min-w-0 flex-col p-3">
                        <div className="flex items-start justify-between gap-1">
                          <p className="min-w-0 truncate text-sm font-medium text-slate-800" title={file.filename}>
                            {file.filename}
                          </p>
                          <CardMenu
                            items={[
                              { label: 'Télécharger', icon: DownloadIcon, onClick: () => handleDownload(file) },
                              { label: 'Renommer', icon: PencilIcon, onClick: () => renameItem('file', file) },
                              { label: 'Déplacer vers…', icon: MoveIcon, onClick: () => setMoving({ kind: 'file', item: file }) },
                              { label: 'Mettre à la corbeille', icon: TrashIcon, danger: true, onClick: () => trashFile(file) },
                            ]}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">{formatDate(file.created_at)}</p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={busyId === file.id}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-2 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-200 disabled:opacity-50"
                          >
                            {busyId === file.id ? <Spinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
                            <span className="hidden sm:inline">Télécharger</span>
                          </button>
                          <button
                            onClick={() => trashFile(file)}
                            disabled={busyId === file.id}
                            title="Mettre à la corbeille"
                            className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition duration-200 hover:bg-red-100 disabled:opacity-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} onDownload={handleDownload} />
      )}

      {moving && (
        <MovePicker
          title={`Déplacer « ${moving.kind === 'file' ? moving.item.filename : moving.item.name} »`}
          excludeFolderId={moving.kind === 'folder' ? moving.item.id : undefined}
          onCancel={() => setMoving(null)}
          onMove={performMove}
        />
      )}
    </main>
  )
}
