import { useState } from 'react'
import { ArrowRight, KeyRound, TerminalSquare } from 'lucide-react'
import DiagnosticEngine from './components/DiagnosticEngine'

const hostedSessionKey = 'terminal-elektronik-hosted-session'
const hostedPin = '1559'

function hasHostedSession() {
  try {
    return sessionStorage.getItem(hostedSessionKey) === 'active'
  } catch {
    return false
  }
}

function HostedPinGate({ children }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(hasHostedSession)

  function handleSubmit(event) {
    event.preventDefault()

    if (pin !== hostedPin) {
      setError('PIN hatalı. Tekrar deneyin.')
      setPin('')
      return
    }

    try {
      sessionStorage.setItem(hostedSessionKey, 'active')
    } catch {
      // The current tab remains unlocked even if browser storage is unavailable.
    }

    setUnlocked(true)
  }

  if (unlocked) {
    return children
  }

  return (
    <main className="app-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-8 text-zinc-100">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <form onSubmit={handleSubmit} className="glass-panel relative w-full max-w-md rounded-lg p-6 sm:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-rose-300/30 bg-gradient-to-br from-rose-500/25 via-amber-400/15 to-cyan-400/20 text-rose-100">
            <TerminalSquare className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold uppercase text-cyan-200">Saha erişimi</div>
            <h1 className="mt-1 text-2xl font-black text-white">Terminal Elektronik</h1>
          </div>
        </div>

        <label htmlFor="hosted-pin" className="mb-2 block text-sm font-bold text-zinc-200">
          Erişim PIN'i
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            id="hosted-pin"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
              setError('')
            }}
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={4}
            autoFocus
            aria-describedby={error ? 'hosted-pin-error' : undefined}
            className="form-control min-h-14 w-full rounded-md px-12 text-center font-mono text-2xl font-black tracking-[0.45em] text-white outline-none placeholder:text-zinc-700"
            placeholder="••••"
          />
        </div>

        <div className="mt-2 min-h-5">
          {error ? <p id="hosted-pin-error" className="text-sm font-semibold text-rose-300">{error}</p> : null}
        </div>

        <button
          type="submit"
          disabled={pin.length !== 4}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-rose-300/45 bg-gradient-to-r from-rose-500/25 via-amber-400/15 to-cyan-400/20 px-4 text-sm font-black text-white transition hover:border-rose-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Teşhis Konsolunu Aç
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </main>
  )
}

function App() {
  const app = <DiagnosticEngine />

  if (import.meta.env.VITE_PUBLIC_HOSTED !== 'true') {
    return app
  }

  return <HostedPinGate>{app}</HostedPinGate>
}

export default App
