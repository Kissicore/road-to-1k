'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

const RETOS = [
  { id: 'road-to-1k', label: 'Road to 1K — FÓRMULA 100K' },
]

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function GestorPage() {
  const [email, setEmail] = useState('')
  const [reto, setReto] = useState(RETOS[0].id)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/admin`,
        shouldCreateUser: false, // solo usuarios que ya existen pueden entrar
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setStatus('sent')
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-block text-sm text-[var(--color-ink-4)] hover:text-[var(--color-ink-3)] mb-8 transition-colors"
        >
          &larr; Volver
        </Link>

        <div className="card-pop p-8 space-y-8">
          {/* Header */}
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-gold)]/15 mb-2">
              <svg
                className="w-6 h-6 text-[var(--color-gold)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5l3.09 6.26L22.5 9l-5.25 5.12 1.24 7.23L12 18.27l-6.49 3.08 1.24-7.23L1.5 9l7.41-1.24L12 1.5z" />
              </svg>
            </div>
            <h1 className="font-display font-black text-xl text-[var(--color-ink)]">
              Gestor de reto
            </h1>
            <p className="text-xs text-[var(--color-ink-4)]">
              Acceso exclusivo para administradoras
            </p>
          </div>

          {status === 'sent' ? (
            /* Estado: link enviado */
            <div className="text-center space-y-3 py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-lime)]/15 mx-auto">
                <svg className="w-7 h-7 text-[var(--color-lime)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-bold text-[var(--color-ink)]">Revisa tu correo</p>
              <p className="text-sm text-[var(--color-ink-4)]">
                Te enviamos un link mágico a <span className="text-[var(--color-ink-2)] font-medium">{email}</span>. Haz clic en él para entrar al panel.
              </p>
              <button
                onClick={() => { setStatus('idle'); setErrorMsg(null) }}
                className="text-xs text-[var(--color-ink-4)] hover:text-[var(--color-ink-3)] underline transition-colors mt-2"
              >
                Usar otro correo
              </button>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Selector de reto */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reto"
                  className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]"
                >
                  Reto
                </label>
                <select
                  id="reto"
                  value={reto}
                  onChange={(e) => setReto(e.target.value)}
                  className="input-pop appearance-none"
                >
                  {RETOS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andrea@email.com"
                  className="input-pop"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-[var(--color-danger)] text-center">
                  {errorMsg}
                </p>
              )}

              <PopButton
                type="submit"
                disabled={status === 'loading'}
                variant="secondary"
                className="w-full"
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar link de acceso'}
              </PopButton>

              <p className="text-center text-xs text-[var(--color-ink-4)]">
                Recibes un link mágico en tu correo — sin contraseña.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[var(--color-ink-4)] mt-6">
          ¿Eres participante?{' '}
          <Link href="/login" className="hover:text-[var(--color-ink-3)] underline transition-colors">
            Entra por aquí
          </Link>
        </p>
      </div>
    </main>
  )
}
