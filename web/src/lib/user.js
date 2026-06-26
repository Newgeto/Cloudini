// Helpers d'affichage des informations utilisateur, partagés par toute l'UI
// pour garder un rendu cohérent (nom complet, initiales de l'avatar).

export function fullName(user) {
  if (!user) return ''
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return name || user.username || user.email || ''
}

export function initials(user) {
  if (!user) return '?'
  const letters = [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('')
  if (letters) return letters.toUpperCase()
  return (user.username?.[0] || user.email?.[0] || '?').toUpperCase()
}
