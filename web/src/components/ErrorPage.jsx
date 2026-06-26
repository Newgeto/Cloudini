import { AlertIcon, CloudIcon, RefreshIcon } from './Icons'

const ERROR_COPY = {
  404: {
    eyebrow: 'Erreur 404',
    title: 'Page introuvable',
    description: "Cette section n'existe pas ou n'est plus disponible dans Cloudini.",
    tone: 'sky',
  },
  500: {
    eyebrow: 'Erreur 500',
    title: 'Quelque chose a bloque',
    description: "L'interface a rencontre une erreur inattendue. Vous pouvez revenir a vos fichiers ou recharger la page.",
    tone: 'red',
  },
  session: {
    eyebrow: 'Session expiree',
    title: 'Reconnectez-vous',
    description: 'Votre session a expire ou le jeton de connexion est invalide.',
    tone: 'amber',
  },
}

export default function ErrorPage({
  type = 500,
  title,
  description,
  primaryLabel = 'Retour aux fichiers',
  secondaryLabel = 'Recharger',
  onPrimary,
  onSecondary,
}) {
  const copy = ERROR_COPY[type] || ERROR_COPY[500]
  const isDanger = copy.tone === 'red'
  const isWarning = copy.tone === 'amber'

  const iconClass = isDanger
    ? 'bg-red-50 text-red-600'
    : isWarning
      ? 'bg-amber-50 text-amber-700'
      : 'bg-indigo-50 text-indigo-700'

  const primaryClass = isDanger
    ? 'bg-red-600 hover:bg-red-500'
    : isWarning
      ? 'bg-amber-600 hover:bg-amber-500'
      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-lg animate-scale-in rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-lg ${iconClass}`}>
          {type === 404 ? <CloudIcon className="h-7 w-7" /> : <AlertIcon className="h-7 w-7" />}
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-400">{copy.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title || copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description || copy.description}</p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {onPrimary && (
            <button
              onClick={onPrimary}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition ${primaryClass}`}
            >
              {primaryLabel}
            </button>
          )}
          {onSecondary && (
            <button
              onClick={onSecondary}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshIcon className="h-4 w-4" />
              {secondaryLabel}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
