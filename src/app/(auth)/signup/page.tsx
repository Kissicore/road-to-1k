'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type FormState = {
  email: string
  full_name: string
  instagram_handle: string
  rubro: string
  followers_initial: string
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({
    email: '',
    full_name: '',
    instagram_handle: '',
    rubro: '',
    followers_initial: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg(null)
    const supabase = createClient()
    const cleanedHandle = form.instagram_handle.trim().replace(/^@/, '').toLowerCase()
    const followers = parseInt(form.followers_initial, 10) || 0
    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard?signup=1`,
        data: {
          full_name: form.full_name,
          instagram_handle: cleanedHandle,
          rubro: form.rubro,
          followers_initial: followers,
        },
      },
    })
    if (error) { setStatus('error'); setErrorMsg(error.message) }
    else { setStatus('sent') }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-block text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink)] mb-8 transition-colors">
          ← Volver
        </Link>

        <div className="card-pop p-8 space-y-8">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary-2)]">
              🎬 <span>Inscripción · 11 de mayo</span>
            </div>
            <h1 className="font-display font-black text-2xl text-[var(--color-ink)]">¡Bienvenida al reto!</h1>
            <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">
              Cuenta solo para miembros activas de FÓRMULA 100K. Andrea aprueba tu inscripción antes de que empiece el reto.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="text-center space-y-3 py-6">
              <p className="text-5xl" aria-hidden>📬</p>
              <p className="font-display font-black text-xl text-[var(--color-ink)]">Inscripción recibida</p>
              <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">
                Revisa tu correo y abre el link mágico para quedar registrada.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
              <Field label="Nombre completo" required value={form.full_name} onChange={(v) => update('full_name', v)} />
              <Field
                label="Usuario de Instagram (sin @)"
                placeholder="andreavega.coach"
                required
                value={form.instagram_handle}
                onChange={(v) => update('instagram_handle', v)}
                hint="Es tu identificador en el reto."
              />
              <Field label="Rubro / nicho" value={form.rubro} onChange={(v) => update('rubro', v)} />
              <Field
                label="Seguidores actuales"
                type="number"
                required
                value={form.followers_initial}
                onChange={(v) => update('followers_initial', v)}
                hint="Es tu punto de partida — mídete contra ti misma."
              />

              <PopButton type="submit" disabled={status === 'sending'} className="w-full">
                {status === 'sending' ? 'Enviando...' : '🚀 Inscribirme'}
              </PopButton>

              {status === 'error' && (
                <p className="text-sm text-[var(--color-danger)] text-center">❌ {errorMsg}</p>
              )}
            </form>
          )}

          <p className="text-center text-sm text-[var(--color-ink-4)]">
            ¿Ya estás inscrita?{' '}
            <Link href="/login" className="text-[var(--color-primary-2)] hover:underline font-bold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder, required, hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input-pop"
      />
      {hint && <p className="text-xs text-[var(--color-ink-4)]">{hint}</p>}
    </div>
  )
}
