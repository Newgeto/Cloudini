// Détermine la nature d'un fichier à partir de son extension, pour choisir
// l'icône, la couleur et le mode d'aperçu (image, pdf, texte, vidéo, audio…).

const KIND_BY_EXT = {
  // Images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
  bmp: 'image', svg: 'image', avif: 'image',
  // Documents
  pdf: 'pdf',
  // Texte / code
  txt: 'text', md: 'text', csv: 'text', json: 'text', xml: 'text',
  log: 'text', yml: 'text', yaml: 'text', ini: 'text',
  js: 'text', jsx: 'text', ts: 'text', tsx: 'text', py: 'text',
  html: 'text', css: 'text', sql: 'text',
  // Vidéo
  mp4: 'video', webm: 'video', ogv: 'video', mov: 'video', mkv: 'video',
  // Audio
  mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio', flac: 'audio',
  // Archives
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
  // Bureautique
  doc: 'doc', docx: 'doc', xls: 'doc', xlsx: 'doc', ppt: 'doc', pptx: 'doc',
}

export function getExtension(filename = '') {
  const dot = filename.lastIndexOf('.')
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : ''
}

export function getFileKind(filename) {
  return KIND_BY_EXT[getExtension(filename)] || 'other'
}

// Indique si un type peut être prévisualisé directement dans le navigateur.
export function isPreviewable(kind) {
  return ['image', 'pdf', 'text', 'video', 'audio'].includes(kind)
}
