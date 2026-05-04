'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Entrar al reto</h1>
          <p className="text-neutral-400 text-sm">
            Te enviamos un link mágico al correo con el que te inscribiste.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/40"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50 transition"
          >
            {status === 'sending' ? 'Enviando…' : 'Recibir link mágico'}
          </button>
        </form>
        {status === 'sent' && (
          <p className="text-sm text-emerald-400 text-center">
            Listo — revisa tu correo y abre el link.
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400 text-center">Error: {errorMsg}</p>
        )}
      </div>
    </main>
  )
}
