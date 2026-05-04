'use client'

import React from 'react'

// ─── PopButton ────────────────────────────────────────────────────────────────
// Primary CTA with optional size variant.
export function PopButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  onClick,
  className = '',
}: {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}) {
  const sizeMap = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }
  const variantMap = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── StatTile ─────────────────────────────────────────────────────────────────
export function StatTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: 'pink' | 'cyan' | 'lime' | 'gold'
}) {
  const accentColor = {
    pink: '#e91e8c',
    cyan: '#00e5ff',
    lime: '#a3e635',
    gold: '#fbbf24',
  }[accent ?? 'pink']

  return (
    <div
      className="card flex flex-col gap-1"
      style={{ borderColor: `${accentColor}33` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
        {label}
      </p>
      <p className="text-3xl font-sans font-bold text-foreground">{value}</p>
    </div>
  )
}

// ─── DayBadge ─────────────────────────────────────────────────────────────────
export function DayBadge({
  day,
  status,
}: {
  day: number
  status: 'valid' | 'pending_review' | 'invalid' | 'duplicate' | 'empty'
}) {
  const styles = {
    valid: 'bg-lime/20 text-lime border-lime/30',
    pending_review: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    invalid: 'bg-red-500/20 text-red-300 border-red-500/30',
    duplicate: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    empty: 'bg-white/5 text-muted border-white/10',
  }
  return (
    <div
      className={`
        w-9 h-9 rounded-lg border flex items-center justify-center
        text-xs font-bold font-sans transition-all
        ${styles[status]}
      `}
      title={`Día ${day} · ${status}`}
    >
      {day}
    </div>
  )
}

// ─── StreakFlame ──────────────────────────────────────────────────────────────
export function StreakFlame({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 animate-pulse-ring w-fit">
      <span className="text-xl select-none" aria-hidden>🔥</span>
      <span className="font-sans font-bold text-primary-soft text-lg leading-none">{count}</span>
      <span className="text-xs text-muted font-body">días seguidos</span>
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
}) {
  return (
    <header className={`space-y-2 ${centered ? 'text-center' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="font-sans font-bold text-3xl text-balance text-foreground">{title}</h1>
      {subtitle && <p className="text-muted text-sm leading-relaxed text-pretty">{subtitle}</p>}
    </header>
  )
}

// ─── GradientCard ─────────────────────────────────────────────────────────────
export function GradientCard({
  children,
  from,
  to,
  className = '',
}: {
  children: React.ReactNode
  from?: string
  to?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-xl p-px ${className}`}
      style={{
        background: `linear-gradient(135deg, ${from ?? '#e91e8c'}, ${to ?? '#00e5ff'})`,
      }}
    >
      <div className="rounded-xl bg-surface p-5 h-full">{children}</div>
    </div>
  )
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
export function StatusPill({
  status,
}: {
  status: string
}) {
  const map: Record<string, string> = {
    valid: 'pill pill-green',
    approved: 'pill pill-green',
    done: 'pill pill-green',
    pending_review: 'pill pill-amber',
    pending: 'pill pill-amber',
    queued: 'pill pill-cyan',
    running: 'pill pill-cyan',
    invalid: 'pill pill-pink',
    rejected: 'pill pill-pink',
    error: 'pill pill-pink',
    duplicate: 'pill pill-muted',
    idle: 'pill pill-muted',
  }
  return <span className={map[status] ?? 'pill pill-muted'}>{status}</span>
}

// ─── FloatingDecor ────────────────────────────────────────────────────────────
// Decorative blurred circle used as ambient background light.
export function FloatingDecor({
  color = '#e91e8c',
  size = 400,
  className = '',
}: {
  color?: string
  size?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full opacity-20 blur-3xl animate-float ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
      }}
    />
  )
}
