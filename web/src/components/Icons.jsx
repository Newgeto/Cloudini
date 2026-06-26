// Petites icônes SVG réutilisables (héritent de la couleur via currentColor).

function Svg({ className = 'h-6 w-6', children }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

export function CloudIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19h11.5Z" />
    </Svg>
  )
}

export function UploadIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </Svg>
  )
}

export function DownloadIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </Svg>
  )
}

export function TrashIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Svg>
  )
}

export function FileIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </Svg>
  )
}

export function LogoutIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  )
}

export function GridIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  )
}

export function ClockIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  )
}

export function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  )
}

export function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  )
}

export function MenuIcon({ className = 'h-6 w-6' }) {
  return (
    <Svg className={className}>
      <path d="M3 12h18" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
    </Svg>
  )
}

export function PlusIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  )
}

export function ChevronDownIcon({ className = 'h-4 w-4' }) {
  return (
    <Svg className={className}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function LockIcon({ className = 'h-5 w-5' }) {
  return (
    <Svg className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  )
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
    </svg>
  )
}
