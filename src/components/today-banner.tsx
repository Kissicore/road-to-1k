'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ideaForDay } from '@/lib/utils/calendar-ideas'
import {
  dayNumberFor,
  nextMidnightInZone,
} from '@/lib/utils/challenge-day'

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'cerrando…'
  const totalMin = Math.floor(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h >= 1) return `${h}h ${m}m`
  return `${m}m`
}

type Props = {
  startDate: string
  totalDays: number
}

type DayState =
  | { kind: 'pre'; daysUntilStart: number }
  | { kind: 'in'; day: number; week: number; dayInWeek: number; title: string; href: string }
  | { kind: 'post' }

function compute(startISO: string, totalDays: number, now: Date): DayState {
  const day = dayNumberFor(now, startISO, totalDays)
  if (day == null) {
    // Antes o después del reto. Distinguimos comparando "hoy en Lima" vs start.
    const todayLima = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now)
    if (todayLima < startISO) {
      const [ty, tm, td] = todayLima.split('-').map(Number)
      const [sy, sm, sd] = startISO.split('-').map(Number)
      const diff = Math.round(
        (Date.UTC(sy, sm - 1, sd) - Date.UTC(ty, tm - 1, td)) / 86_400_000,
      )
      return { kind: 'pre', daysUntilStart: diff }
    }
    return { kind: 'post' }
  }
  const idea = ideaForDay(day)
  if (!idea) return { kind: 'post' }
  return {
    kind: 'in',
    day,
    week: idea.week,
    dayInWeek: idea.dayInWeek,
    title: idea.title,
    href: idea.href,
  }
}

export function TodayBanner({ startDate, totalDays }: Props) {
  const [state, setState] = useState<DayState | null>(null)
  const [countdown, setCountdown] = useState<string | null>(null)

  useEffect(() => {
    setState(compute(startDate, totalDays, new Date()))

    const nextMidnight = nextMidnightInZone()
    // +5s de margen para evitar carreras en el cambio de día.
    const ms = Math.max(60_000, nextMidnight - Date.now() + 5_000)
    const t = setTimeout(() => {
      setState(compute(startDate, totalDays, new Date()))
    }, ms)
    return () => clearTimeout(t)
  }, [startDate, totalDays])

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(nextMidnightInZone() - Date.now()))
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!state) {
    return <div aria-hidden className="h-12 sm:h-11 w-full" />
  }

  if (state.kind === 'pre') {
    return (
      <div className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-b-2 border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-center">
          <span className="text-lg">⏳</span>
          <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-tight">
            <strong className="text-[var(--color-warning)]">
              Faltan {state.daysUntilStart} {state.daysUntilStart === 1 ? 'día' : 'días'}
            </strong>{' '}
            <span className="text-[var(--color-ink-3)]">para arrancar el reto</span>
          </p>
        </div>
      </div>
    )
  }

  if (state.kind === 'post') {
    return (
      <div className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-b-2 border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-center">
          <span className="text-lg">🏁</span>
          <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-tight">
            <strong className="text-[var(--color-success)]">Reto cerrado.</strong>{' '}
            <span className="text-[var(--color-ink-3)]">Calendarios disponibles para repaso.</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={state.href}
      target="_blank"
      rel="noopener noreferrer"
      className="sticky top-0 z-50 block bg-[var(--color-surface)]/95 backdrop-blur-md border-b-2 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/95 transition-colors group"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 flex items-center gap-3">
        <div className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--color-primary-2)]">
            Día {state.day}/{totalDays}
          </span>
        </div>
        <div className="hidden sm:flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)]">
            S{state.week} · D{state.dayInWeek}
          </span>
        </div>
        <p className="flex-1 min-w-0 text-xs sm:text-sm text-[var(--color-ink-2)] leading-tight truncate">
          <span className="text-[var(--color-ink-3)] mr-1">Hoy toca:</span>
          <strong className="text-[var(--color-ink)]">{state.title}</strong>
        </p>
        {countdown && (
          <span
            className="hidden md:inline shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-3)]"
            title="El día del reto cierra a las 23:59 hora de Lima 🇵🇪 (UTC-5)."
          >
            🕒 Cierra en {countdown}
          </span>
        )}
        <span className="hidden sm:inline shrink-0 text-xs font-black text-[var(--color-accent)] group-hover:translate-x-1 transition-transform">
          Abrir →
        </span>
      </div>
    </Link>
  )
}
