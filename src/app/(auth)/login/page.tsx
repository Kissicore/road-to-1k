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
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-sm text-[var(--color-ink-3)] hover:text-white mb-6">
          ← Volver
        </Link>
        <div className="card-pop p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--color-primary)]/15 blur-3xl" />
          <div className="relative">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="font-display text-3xl font-black">Entrar al reto</h1>
            <p className="text-[var(--color-ink-3)] text-sm mt-1">
              Te mandamos un link mágico al correo. Sin contraseñas.
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 relative">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-[var(--color-ink-2)]">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-pop"
              />
            </label>
            <PopButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={status === 'sending'}
              className="w-full"
            >
              {status === 'sending' ? 'Enviando...' : '✨ Recibir link mágico'}
            </PopButton>
          </form>
          {status === 'sent' && (
            <div className="rounded-2xl bg-[var(--color-success)]/15 border-2 border-[var(--color-success)]/40 p-4 text-sm text-[var(--color-success)]">
              📬 Listo. Revisa tu correo y abre el link.
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-2xl bg-[var(--color-danger)]/15 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]">
              ❌ {errorMsg}
            </div>
          )}
        </div>
        <p className="text-center text-sm text-[var(--color-ink-3)] mt-6">
          ¿Aún no estás inscrita?{' '}
          <Link href="/signup" className="text-[var(--color-accent)] font-bold hover:underline">
            Inscríbete acá
          </Link>
        </p>
      </div>
    </main>
  )
}
