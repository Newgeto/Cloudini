// Associe chaque type de fichier à une icône et une couleur (à la Google Drive).
import { ArchiveIcon, FileIcon, FileTextIcon, FilmIcon, ImageIcon, MusicIcon } from './Icons'

const KIND_VISUAL = {
  image: { Icon: ImageIcon, badge: 'bg-violet-50 text-violet-600', label: 'Image' },
  pdf: { Icon: FileTextIcon, badge: 'bg-red-50 text-red-600', label: 'PDF' },
  text: { Icon: FileTextIcon, badge: 'bg-sky-50 text-sky-600', label: 'Texte' },
  video: { Icon: FilmIcon, badge: 'bg-amber-50 text-amber-600', label: 'Vidéo' },
  audio: { Icon: MusicIcon, badge: 'bg-emerald-50 text-emerald-600', label: 'Audio' },
  archive: { Icon: ArchiveIcon, badge: 'bg-orange-50 text-orange-600', label: 'Archive' },
  doc: { Icon: FileTextIcon, badge: 'bg-indigo-50 text-indigo-600', label: 'Document' },
  other: { Icon: FileIcon, badge: 'bg-slate-100 text-slate-500', label: 'Fichier' },
}

export function visualFor(kind) {
  return KIND_VISUAL[kind] || KIND_VISUAL.other
}
