'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type Props = {
  initial: {
    email: string
    full_name: string
    instagram_handle: string
    profile_url: string
  }
}

export function PerfilForm({ initial }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initial.full_name)
  const [handle, setHandle] = useState(initial.instagram_handle)
  const [profileUrl, setProfileUrl] = useState(initial.profile_url)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const cleanedHandle = handle.trim().replace(/^@/, '').toLowerCase()
  const cleanedName = fullName.trim()
  const cleanedUrl = profileUrl.trim()

  const dirty =
    cleanedName !== initial.full_name ||
    cleanedHandle !== initial.instagram_handle ||
    cleanedUrl !== initial.profile_url

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dirty) return
    setStatus('saving')
    setErrorMsg(null)

    if (!cleanedName) {
      setErrorMsg('Tu nombre no puede ir vacío.')
      setStatus('error')
      return
    }
    if (!cleanedHandle) {
      setErrorMsg('Tu usuario de Instagram no puede ir vacío.')
      setStatus('error')
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Sesión expirada')
      setStatus('error')
      return
    }

    const { error } = await supabase
      .from('participants')
      .update({
        full_name: cleanedName,
        instagram_handle: cleanedHandle,
        profile_url: cleanedUrl || null,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505') {
        setErrorMsg(`El usuario @${cleanedHandle} ya está tomado por otra participante.`)
      } else {
        setErrorMsg(error.message)
      }
      setStatus('error')
      return
    }
    setStatus('done')
    router.refresh()
  }

  return (
    <section className="card-pop p-6 sm:p-7 space-y-5">
      <header className="space-y-1">
        <h2 className="font-display font-black text-xl text-[var(--color-ink)]">
          Datos de inscripción
        </h2>
        <p className="text-sm text-[var(--color-ink-3)]">
          Corrige tu nombre, actualiza tu @ de Instagram o agrega el link a tu perfil.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          value={initial.email}
          onChange={() => {}}
          disabled
          hint="No se puede cambiar — escríbele a Andrea si necesitas otro."
        />
        <Field
          label="Nombre completo"
          required
          value={fullName}
          onChange={setFullName}
        />
        <Field
          label="Usuario de Instagram (sin @)"
          required
          value={handle}
          onChange={setHandle}
          placeholder="andreavega.coach"
          hint="Es tu identificador en el reto y el ranking."
        />
        <Field
          label="Link a tu perfil"
          type="url"
          value={profileUrl}
          onChange={setProfileUrl}
          placeholder={`https://instagram.com/${cleanedHandle || 'tuusuario'}`}
          hint="Opcional — útil si tu link en bio difiere del @."
        />

        <div className="flex items-center gap-3 pt-2">
          <PopButton type="submit" disabled={!dirty || status === 'saving'} size="sm">
            {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
          </PopButton>
          {status === 'done' && !dirty && (
            <span className="text-xs font-bold text-[var(--color-success)]">✓ Guardado</span>
          )}
          {status === 'error' && (
            <span className="text-xs text-[var(--color-danger)] font-bold">❌ {errorMsg}</span>
          )}
        </div>
      </form>
    </section>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder, required, hint, disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="input-pop disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-xs text-[var(--color-ink-4)]">{hint}</p>}
    </div>
  )
}
