'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setStatus('error'); setErrorMsg(error.message) }
    else { setStatus('sent') }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink)] mb-8 transition-colors">
          ← Volver
        </Link>

        <div className="card-pop p-8 space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-4xl" aria-hidden>🔑</span>
            <h1 className="font-display font-black text-2xl text-[var(--color-ink)]">Entrar al reto</h1>
            <p className="text-sm text-[var(--color-ink-3)]">Te mandamos un link mágico al correo. Sin contraseñas.</p>
          </div>

          {status !== 'sent' ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-pop"
                />
              </div>
              <PopButton type="submit" disabled={status === 'sending'} className="w-full">
                {status === 'sending' ? 'Enviando...' : '✨ Recibir link mágico'}
              </PopButton>
            </form>
          ) : (
            <div className="text-center space-y-3 py-4">
              <p className="text-4xl" aria-hidden>📬</p>
              <p className="text-sm font-semibold text-[var(--color-success)]">Listo. Revisa tu correo y abre el link.</p>
            </div>
          )}

          {status === 'error' && (
            <p className="text-sm text-[var(--color-danger)] text-center">❌ {errorMsg}</p>
          )}

          <p className="text-center text-sm text-[var(--color-ink-4)]">
            ¿Aún no estás inscrita?{' '}
            <Link href="/signup" className="text-[var(--color-primary-2)] hover:underline font-bold">
              Inscríbete acá
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
