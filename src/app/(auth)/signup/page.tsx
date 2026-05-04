'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Inscripción · Edición 11 de mayo
          </p>
          <h1 className="text-3xl font-semibold">Inscríbete al reto</h1>
          <p className="text-neutral-400 text-sm">
            Después de inscribirte, Andrea aprueba tu cuenta y recibes acceso al
            dashboard. Solo miembros activas de FÓRMULA 100K.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(v) => update('email', v)}
          />
          <Field
            label="Nombre y apellido"
            required
            value={form.full_name}
            onChange={(v) => update('full_name', v)}
          />
          <Field
            label="Usuario de Instagram"
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
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50 transition"
          >
            {status === 'sending' ? 'Enviando…' : 'Inscribirme'}
          </button>
        </form>

        {status === 'sent' && (
          <p className="text-sm text-emerald-400 text-center">
            Listo. Revisa tu correo, abre el link mágico y queda registrada.
            Andrea revisa la inscripción antes del 10 de mayo.
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400 text-center">Error: {errorMsg}</p>
        )}
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-neutral-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/40"
      />
    </label>
  )
}
