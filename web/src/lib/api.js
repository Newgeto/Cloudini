// Client HTTP minimal pour l'API Cloudini.
// L'URL de base provient de la variable d'environnement Vite (web/.env).
const BASE_URL = import.meta.env.VITE_API_URL || ''

const TOKEN_KEY = 'cloudini_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Effectue une requête et gère le token + les erreurs de l'API.
async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {}
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`

  let payload
  if (form) {
    payload = form // FormData ou URLSearchParams (Content-Type géré par le navigateur)
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = data?.detail
    const error = new Error(typeof detail === 'string' ? detail : 'Une erreur est survenue.')
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  getToken,
  logout: () => setToken(null),

  register: (data) =>
    request('/auth/register', { method: 'POST', body: data, auth: false }),

  async login(email, password) {
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    const data = await request('/auth/login', { method: 'POST', form, auth: false })
    setToken(data.access_token)
    return data
  },

  me: () => request('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    request('/auth/me/password', {
      method: 'PUT',
      body: { current_password: currentPassword, new_password: newPassword },
    }),

  // Fichiers d'un dossier (folderId nul = racine).
  listFiles: (folderId = null) =>
    request(folderId == null ? '/files' : `/files?folder=${folderId}`),

  // Tous les fichiers, tous dossiers confondus (vue « Récents »).
  listAllFiles: () => request('/files?all_files=true'),

  listTrash: () => request('/files/trash'),

  uploadFile(file, folderId = null) {
    const form = new FormData()
    form.append('upload', file)
    if (folderId != null) form.append('folder_id', folderId)
    return request('/files', { method: 'POST', form })
  },

  renameFile: (id, filename) =>
    request(`/files/${id}`, { method: 'PATCH', body: { filename } }),

  moveFile: (id, folderId) =>
    request(`/files/${id}`, { method: 'PATCH', body: { folder_id: folderId, move: true } }),

  // Met le fichier à la corbeille (suppression douce, réversible).
  deleteFile: (id) => request(`/files/${id}`, { method: 'DELETE' }),

  restoreFile: (id) => request(`/files/${id}/restore`, { method: 'POST' }),

  // Supprime définitivement un fichier de la corbeille.
  deleteFilePermanent: (id) => request(`/files/${id}/permanent`, { method: 'DELETE' }),

  // --- Dossiers ---
  listFolders: (parentId = null) =>
    request(parentId == null ? '/folders' : `/folders?parent=${parentId}`),

  createFolder: (name, parentId = null) =>
    request('/folders', { method: 'POST', body: { name, parent_id: parentId } }),

  folderBreadcrumb: (id) => request(`/folders/${id}/breadcrumb`),

  renameFolder: (id, name) =>
    request(`/folders/${id}`, { method: 'PATCH', body: { name } }),

  moveFolder: (id, parentId) =>
    request(`/folders/${id}`, { method: 'PATCH', body: { parent_id: parentId, move: true } }),

  deleteFolder: (id) => request(`/folders/${id}`, { method: 'DELETE' }),

  restoreFolder: (id) => request(`/folders/${id}/restore`, { method: 'POST' }),

  deleteFolderPermanent: (id) => request(`/folders/${id}/permanent`, { method: 'DELETE' }),

  listTrashFolders: () => request('/folders/trash'),

  // Récupère le contenu d'un fichier (auth via header) sous forme d'URL d'objet,
  // utilisée pour l'aperçu inline (image, PDF, texte…). À révoquer après usage.
  async fileObjectUrl(id) {
    const res = await fetch(`${BASE_URL}/files/${id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) throw new Error('Aperçu impossible.')
    const blob = await res.blob()
    return { url: URL.createObjectURL(blob), type: blob.type, blob }
  },

  // Le téléchargement nécessite le header d'auth : on récupère un blob puis on déclenche la sauvegarde.
  async downloadFile(id, filename) {
    const res = await fetch(`${BASE_URL}/files/${id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) throw new Error('Téléchargement impossible.')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}
