import { useEffect, useRef, useState } from 'react'

import { DotsIcon } from './Icons'

// Petit menu contextuel (kebab) pour les actions d'une carte fichier/dossier.
export default function CardMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        title="Plus d'actions"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-800"
      >
        <DotsIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  item.onClick()
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition duration-150 ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
