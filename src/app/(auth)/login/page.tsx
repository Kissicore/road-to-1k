'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FloatingDecor } from '@/components/ui'

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
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <FloatingDecor color="#e91e8c" size={400} className="-top-20 -left-20" />
      <FloatingDecor color="#00e5ff" size={300} className="-bottom-10 -right-10" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="card-glow space-y-8 p-8">
          <div className="space-y-2 text-center">
            <p className="eyebrow">Road to 1K</p>
            <h1 className="font-sans font-black text-3xl text-foreground">Entrar al reto</h1>
            <p className="text-muted text-sm leading-relaxed">
              Te enviamos un link mágico al correo con el que te inscribiste.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-4xl" aria-hidden>📬</p>
              <p className="text-sm text-lime font-semibold">Revisa tu correo y abre el link.</p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-ghost text-sm"
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input"
                />
              </label>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary w-full"
              >
                {status === 'sending' ? 'Enviando…' : 'Recibir link mágico'}
              </button>

              {status === 'error' && (
                <p className="text-sm text-red-400 text-center">Error: {errorMsg}</p>
              )}
            </form>
          )}

          <p className="text-center text-sm text-muted">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-primary-soft hover:underline font-semibold">
              Inscríbete aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
