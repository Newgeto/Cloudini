// Client HTTP minimal pour l'API Cloudini.
// L'URL de base provient de la variable d'environnement Vite (web/.env).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

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
    throw new Error(typeof detail === 'string' ? detail : 'Une erreur est survenue.')
  }
  return data
}

export const api = {
  getToken,
  logout: () => setToken(null),

  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: { email, password }, auth: false }),

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

  listFiles: () => request('/files'),

  uploadFile(file) {
    const form = new FormData()
    form.append('upload', file)
    return request('/files', { method: 'POST', form })
  },

  deleteFile: (id) => request(`/files/${id}`, { method: 'DELETE' }),

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
