import { useEffect, useState } from 'react'

import { api } from '../lib/api'
import { getFileKind } from '../lib/fileType'
import { visualFor } from './fileVisuals'

// Vignette d'un fichier : aperçu réel pour les images, icône typée sinon.
export default function FileThumb({ file, iconClass = 'h-10 w-10' }) {
  const kind = getFileKind(file.filename)
  const visual = visualFor(kind)
  const [imgUrl, setImgUrl] = useState(null)

  useEffect(() => {
    if (kind !== 'image') return undefined
    let active = true
    let created
    api
      .fileObjectUrl(file.id)
      .then((res) => {
        if (active) {
          created = res.url
          setImgUrl(res.url)
        } else {
          URL.revokeObjectURL(res.url)
        }
      })
      .catch(() => {})
    return () => {
      active = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [file.id, kind])

  if (kind === 'image' && imgUrl) {
    return <img src={imgUrl} alt={file.filename} loading="lazy" className="h-full w-full object-cover" />
  }

  const { Icon } = visual
  return (
    <div className={`flex h-full w-full items-center justify-center ${visual.badge}`}>
      <Icon className={iconClass} />
    </div>
  )
}
