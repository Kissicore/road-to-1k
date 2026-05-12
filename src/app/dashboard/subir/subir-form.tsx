'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type Existing = {
  id: string
  reel_url: string
  observations: string | null
  correction_count: number
} | null

const MAX_CORRECTIONS = 2

export function SubirForm({
  dayNumber, existing, isLate = false,
}: { dayNumber: number; existing: Existing; isLate?: boolean }) {
  const router = useRouter()
  const [reelUrl, setReelUrl] = useState(existing?.reel_url ?? '')
  const [observations, setObservations] = useState(existing?.observations ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const corrections = existing?.correction_count ?? 0
  const correctionsLeft = Math.max(0, MAX_CORRECTIONS - corrections)
  const urlChanged = existing ? reelUrl.trim() !== existing.reel_url : true
  const correctionExhausted = !!existing && urlChanged && correctionsLeft === 0

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    if (correctionExhausted) {
      setErrorMsg(`Ya usaste tus ${MAX_CORRECTIONS} correcciones para este día. Escribile a Andrea si necesitás cambiar el link.`)
      setStatus('error')
      return
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErrorMsg('Sesión expirada'); setStatus('error'); return }

    setStatus('saving')
    const payload = {
      participant_id: user.id,
      day_number: dayNumber,
      reel_url: reelUrl.trim(),
      observations: observations.trim() || null,
      status: 'valid' as const,
    }
    const { error } = existing
      ? await supabase.from('daily_submissions').update(payload).eq('id', existing.id)
      : await supabase.from('daily_submissions').insert(payload)

    if (error) {
      // El trigger del lado de DB usa errcode P0001 cuando se exceden las 2 correcciones.
      const friendly = error.code === 'P0001'
        ? `Ya usaste tus ${MAX_CORRECTIONS} correcciones para este día. Escribile a Andrea si necesitás cambiar el link.`
        : error.message
      setErrorMsg(friendly)
      setStatus('error')
      return
    }

    setStatus('done')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {isLate && (
        <div className="rounded-2xl bg-[var(--color-warning)]/10 border-2 border-[var(--color-warning)]/40 p-4 text-sm text-[var(--color-warning)]">
          <p className="font-bold mb-1">⏰ Día atrasado — Día {dayNumber}</p>
          <p className="text-[var(--color-ink-2)]">
            Asegurate que el Reel que pegues haya sido publicado el día {dayNumber} del reto. Andrea puede revisar la fecha del post desde admin.
          </p>
        </div>
      )}

      {existing && (
        <div className={
          correctionsLeft === 0
            ? 'rounded-2xl bg-[var(--color-danger)]/10 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]'
            : 'rounded-2xl bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] p-4 text-sm text-[var(--color-ink-2)]'
        }>
          <p className="font-bold mb-1">
            {correctionsLeft === 0 ? '🚫 Sin correcciones disponibles' : `✏️ Te quedan ${correctionsLeft} ${correctionsLeft === 1 ? 'corrección' : 'correcciones'}`}
          </p>
          <p className="text-[var(--color-ink-3)]">
            {correctionsLeft === 0
              ? 'Ya editaste el link 2 veces. Si pegaste mal el link, avisale a Andrea.'
              : `Podés actualizar el link hasta ${MAX_CORRECTIONS} veces si te equivocaste. Las observaciones se pueden editar libremente.`}
          </p>
        </div>
      )}

      {/* Reel URL */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Link del Reel publicado</span>
        <input
          type="url"
          required
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="input"
          disabled={correctionExhausted}
        />
      </label>

      {/* Observations */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Observaciones (opcional)</span>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={3}
          placeholder="Algo que quieras que Andrea sepa."
          className="input"
        />
      </label>

      <PopButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'saving' || correctionExhausted}
        className="btn-primary w-full text-base py-4"
      >
        {status === 'saving' ? 'Guardando…'
          : existing && urlChanged ? `Corregir link (${corrections + 1}/${MAX_CORRECTIONS})`
          : existing ? 'Actualizar día'
          : 'Registrar día'}
      </PopButton>

      {status === 'done' && (
        <p className="text-sm text-lime text-center font-semibold">
          Listo. Tu día quedó registrado.
        </p>
      )}
      {status === 'error' && (
        <div className="rounded-2xl bg-[var(--color-danger)]/15 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]">
          ❌ {errorMsg}
        </div>
      )}
    </form>
  )
}
