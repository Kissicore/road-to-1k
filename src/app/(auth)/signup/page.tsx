'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FloatingDecor } from '@/components/ui'

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
        emailRedirectTo:
          (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`) + '?signup=1',
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

  if (status === 'sent') {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
        <FloatingDecor color="#a3e635" size={400} className="-top-20 -right-20" />
        <div className="relative z-10 card-glow max-w-md w-full p-10 text-center space-y-4 animate-fade-in">
          <p className="text-5xl" aria-hidden>🎉</p>
          <h2 className="font-sans font-black text-2xl text-foreground">Inscripción recibida</h2>
          <p className="text-muted text-sm leading-relaxed">
            Revisa tu correo y abre el link mágico para quedar registrada.
            Andrea revisa la inscripción antes del <strong className="text-foreground">10 de mayo</strong>.
          </p>
          <Link href="/login" className="btn-outline inline-flex mt-2">Ya tengo link</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <FloatingDecor color="#e91e8c" size={500} className="-top-32 -left-32" />
      <FloatingDecor color="#00e5ff" size={350} className="-bottom-20 -right-20" />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="card-glow space-y-7 p-8">
          <div className="space-y-2 text-center">
            <p className="eyebrow">Inscripción · Edición 11 de mayo</p>
            <h1 className="font-sans font-black text-3xl text-foreground">Únete al reto</h1>
            <p className="text-muted text-sm leading-relaxed text-pretty">
              Solo para miembros activas de FÓRMULA 100K. Andrea aprueba tu cuenta antes del comienzo.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
            <Field label="Nombre y apellido" required value={form.full_name} onChange={(v) => update('full_name', v)} />
            <Field
              label="Usuario de Instagram"
              placeholder="andreavega.coach"
              required
              value={form.instagram_handle}
              onChange={(v) => update('instagram_handle', v)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Rubro / nicho"
                placeholder="Coach, agencia…"
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
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary w-full text-base py-4"
            >
              {status === 'sending' ? 'Enviando…' : 'Inscribirme al reto'}
            </button>

            {status === 'error' && (
              <p className="text-sm text-red-400 text-center">Error: {errorMsg}</p>
            )}
          </form>

          <p className="text-center text-sm text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-soft hover:underline font-semibold">
              Entrar
            </Link>
          </p>
        </div>
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
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input"
      />
    </label>
  )
}
