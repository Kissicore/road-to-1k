'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type Props = {
  initial: string
  challengeEnded: boolean
  todayDay: number | null
  totalDays: number
}

const MAX_CHARS = 2000

export function CartaForm({ initial, challengeEnded, todayDay, totalDays }: Props) {
  const router = useRouter()
  const [text, setText] = useState(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const trimmed = text.trim()
  const initialTrimmed = initial.trim()
  const dirty = trimmed !== initialTrimmed

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dirty) return
    setStatus('saving')
    setErrorMsg(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Sesión expirada')
      setStatus('error')
      return
    }

    const { error } = await supabase
      .from('participants')
      .update({ final_message: trimmed || null })
      .eq('id', user.id)

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }
    setStatus('done')
    router.refresh()
  }

  const daysLeft = todayDay === null ? null : Math.max(0, totalDays - todayDay)
  const subtitle = challengeEnded
    ? '¡Terminaste el reto! ¿Qué te llevas? Escríbele a la versión de ti que recién empezaba.'
    : daysLeft !== null && daysLeft > 0
      ? `Cuando termines el reto vas a querer dejarte un mensaje. Faltan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}.`
      : 'Al cerrar el reto, vuelve a escribir aquí qué te llevas.'

  return (
    <section
      className="card-pop p-6 sm:p-7 space-y-4"
      style={
        challengeEnded
          ? { boxShadow: '0 0 28px rgba(126, 232, 255, 0.28), var(--shadow-pop)' }
          : undefined
      }
    >
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>💌</span>
          <h2 className="font-display font-black text-xl text-[var(--color-ink)]">
            Carta a tu yo del pasado
          </h2>
          {challengeEnded && (
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-success)] bg-[var(--color-success)]/15 border border-[var(--color-success)]/40 rounded-full px-2 py-0.5">
              Reto cerrado
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">{subtitle}</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Querida yo del 10 de mayo: lo que aprendí en estos 42 días es…"
          rows={8}
          className="input-pop resize-y min-h-[200px] leading-relaxed"
        />
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-4)]">
          <span>{text.length}/{MAX_CHARS}</span>
          <span>Solo tú la ves — opcional.</span>
        </div>
        <div className="flex items-center gap-3">
          <PopButton
            type="submit"
            disabled={!dirty || status === 'saving'}
            size="sm"
            variant={challengeEnded ? 'accent' : 'primary'}
          >
            {status === 'saving' ? 'Guardando…' : initialTrimmed ? 'Actualizar carta' : 'Guardar carta'}
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
