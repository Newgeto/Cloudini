import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { AlertIcon, CheckIcon, CloseIcon } from '../Icons'

const UIContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI doit être utilisé dans <UIProvider>')
  return ctx
}

let toastSeq = 0

// Fournit des pop-ups stylisées (confirm/prompt) et des notifications (toasts),
// cohérentes sur web/iOS/Android/PC, en remplacement des dialogues natifs.
export function UIProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, type = 'info', duration = 3600) => {
      const id = ++toastSeq
      setToasts((list) => [...list, { id, message, type }])
      if (duration) setTimeout(() => removeToast(id), duration)
      return id
    },
    [removeToast],
  )

  const value = useMemo(() => {
    const open = (kind, options) =>
      new Promise((resolve) => setDialog({ kind, resolve, ...options }))
    return {
      confirm: (options) => open('confirm', options),
      prompt: (options) => open('prompt', options),
      toast: {
        success: (m, d) => pushToast(m, 'success', d),
        error: (m, d) => pushToast(m, 'error', d ?? 5000),
        info: (m, d) => pushToast(m, 'info', d),
      },
    }
  }, [pushToast])

  function closeDialog(result) {
    dialog?.resolve(result)
    setDialog(null)
  }

  return (
    <UIContext.Provider value={value}>
      {children}
      {dialog && <Dialog dialog={dialog} onClose={closeDialog} />}
      <Toaster toasts={toasts} onDismiss={removeToast} />
    </UIContext.Provider>
  )
}

function Dialog({ dialog, onClose }) {
  const isPrompt = dialog.kind === 'prompt'
  const [value, setValue] = useState(dialog.defaultValue || '')
  const danger = dialog.danger

  function submit(e) {
    e?.preventDefault()
    onClose(isPrompt ? value.trim() : true)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        aria-label="Annuler"
        onClick={() => onClose(isPrompt ? null : false)}
        className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm"
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {danger && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertIcon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900">{dialog.title}</h2>
              {dialog.message && <p className="mt-1 text-sm text-slate-500">{dialog.message}</p>}
            </div>
          </div>

          {isPrompt && (
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={dialog.placeholder}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={() => onClose(isPrompt ? null : false)}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-200/60"
          >
            {dialog.cancelLabel || 'Annuler'}
          </button>
          <button
            type="submit"
            disabled={isPrompt && !value.trim()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${
              danger
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
            }`}
          >
            {dialog.confirmLabel || (isPrompt ? 'Valider' : 'Confirmer')}
          </button>
        </div>
      </form>
    </div>
  )
}

const TOAST_STYLE = {
  success: { ring: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-700', Icon: CheckIcon },
  error: { ring: 'border-red-200', icon: 'bg-red-100 text-red-700', Icon: AlertIcon },
  info: { ring: 'border-slate-200', icon: 'bg-indigo-100 text-indigo-700', Icon: CheckIcon },
}

function Toaster({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end">
      {toasts.map((toast) => {
        const style = TOAST_STYLE[toast.type] || TOAST_STYLE.info
        const Icon = style.Icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${style.ring}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.icon}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition duration-200 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
