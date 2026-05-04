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
        emailRedirectTo: `${window.location.origin}/auth/callback?signup=1`,
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
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link href="/" className="block text-sm text-[var(--color-ink-3)] hover:text-white mb-6">
          ← Volver
        </Link>
        <div className="card-pop p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[var(--color-accent)]/15 blur-3xl" />
          <div className="relative space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/15 border-2 border-[var(--color-primary)]/40">
              <span>🎬</span>
              <span className="text-xs font-display font-bold uppercase tracking-wide text-[var(--color-primary-2)]">
                Inscripción · 11 de mayo
              </span>
            </div>
            <h1 className="font-display text-3xl font-black">¡Bienvenida al reto!</h1>
            <p className="text-[var(--color-ink-3)] text-sm">
              Cuenta solo para miembros activas de FÓRMULA 100K. Andrea aprueba tu inscripción antes de que empiece el reto.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3 relative">
            <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
            <Field label="Nombre y apellido" required value={form.full_name} onChange={(v) => update('full_name', v)} />
            <Field
              label="Tu @ de Instagram"
              placeholder="andreavega.coach"
              required
              value={form.instagram_handle}
              onChange={(v) => update('instagram_handle', v)}
            />
            <Field
              label="Rubro / nicho"
              placeholder="Coach, agencia, e-commerce…"
              value={form.rubro}
              onChange={(v) => update('rubro', v)}
            />
            <Field
              label="Seguidores actuales"
              type="number"
              required
              value={form.followers_initial}
              onChange={(v) => update('followers_initial', v)}
              hint="Es tu punto de partida — mídete contra ti misma."
            />

            <PopButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={status === 'sending'}
              className="w-full mt-2"
            >
              {status === 'sending' ? 'Enviando...' : '🚀 Inscribirme'}
            </PopButton>
          </form>

          {status === 'sent' && (
            <div className="rounded-2xl bg-[var(--color-success)]/15 border-2 border-[var(--color-success)]/40 p-4 text-sm text-[var(--color-success)]">
              📬 Listo. Revisa tu correo, abre el link mágico y queda registrada.
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-2xl bg-[var(--color-danger)]/15 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]">
              ❌ {errorMsg}
            </div>
          )}
        </div>
        <p className="text-center text-sm text-[var(--color-ink-3)] mt-6">
          ¿Ya estás inscrita?{' '}
          <Link href="/login" className="text-[var(--color-accent)] font-bold hover:underline">
            Inicia sesión
          </Link>
        </p>
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
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-[var(--color-ink-2)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input-pop"
      />
      {hint && <span className="block text-xs text-[var(--color-ink-4)]">{hint}</span>}
    </label>
  )
}
