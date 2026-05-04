/* Componentes base del Road to 1K — estilo Kahoot premium. */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'accent' | 'success' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  accent:    'btn-accent',
  success:   'btn-success',
  ghost:     'btn-ghost',
}
const sizeClass: Record<Size, string> = {
  sm: 'btn-pop-sm',
  md: 'btn-pop-md',
  lg: 'btn-pop-lg',
}

export function PopButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  onClick,
}: {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn('btn-pop', variantClass[variant], sizeClass[size], className)}
    >
      {children}
    </button>
  )
}

export function PopLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: {
  href: string
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn('btn-pop', variantClass[variant], sizeClass[size], className)}
    >
      {children}
    </Link>
  )
}

/** Tile grande con número y label. */
export function StatTile({
  label,
  value,
  accent = 'primary',
  hint,
}: {
  label: string
  value: ReactNode
  accent?: 'primary' | 'secondary' | 'accent' | 'success'
  hint?: string
}) {
  const ringClass = {
    primary:   'from-[#FF1F8B] to-[#FF4FA1]',
    secondary: 'from-[#7B2CBF] to-[#9D4EDD]',
    accent:    'from-[#00E5FF] to-[#00B4D8]',
    success:   'from-[#C7F464] to-[#DEFB7E]',
  }[accent]
  return (
    <div className="card-pop p-6 relative overflow-hidden">
      <div className={cn('absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 blur-2xl bg-gradient-to-br', ringClass)} />
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink-3)] font-bold">{label}</p>
      <p className="font-display text-5xl font-black mt-2">{value}</p>
      {hint && <p className="text-sm text-[var(--color-ink-3)] mt-1">{hint}</p>}
    </div>
  )
}

/** Badge circular con número de día. */
export function DayBadge({
  day,
  state = 'upcoming',
}: {
  day: number
  state?: 'done' | 'today' | 'upcoming' | 'missed'
}) {
  const styles: Record<typeof state, string> = {
    done:     'bg-[var(--color-success)] text-[var(--color-bg)] border-[#9bc83a]',
    today:    'bg-[var(--color-primary)] text-white border-[#c01670] pulse-ring',
    upcoming: 'bg-[var(--color-surface)] text-[var(--color-ink-3)] border-[var(--color-border)]',
    missed:   'bg-[var(--color-danger)] text-white border-[#cc3636] opacity-80',
  } as const
  return (
    <div
      className={cn(
        'w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-display font-black text-lg',
        styles[state]
      )}
      title={`Día ${day} — ${state}`}
    >
      {day}
    </div>
  )
}

/** Llama de racha (streak). */
export function StreakFlame({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF1F8B] to-[#FFD23F] text-white font-display font-black text-lg shadow-[var(--shadow-pop-sm)] border-2 border-black/30">
      <span className="text-xl">🔥</span>
      <span>{count}</span>
      <span className="text-xs uppercase tracking-wider opacity-90">racha</span>
    </div>
  )
}

/** Header de página con gradiente. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
}) {
  return (
    <header className="space-y-3">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-accent)]">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl sm:text-5xl font-black leading-[1.05]">
        {title}
      </h1>
      {subtitle && <p className="text-[var(--color-ink-3)] max-w-2xl">{subtitle}</p>}
    </header>
  )
}

/** Card con gradient border. */
export function GradientCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'card-pop p-6',
        glow && 'shadow-[var(--shadow-pop),var(--shadow-glow)]',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Pill estado de submission. */
export function StatusPill({
  state,
  label,
}: {
  state: 'success' | 'warn' | 'danger' | 'info' | 'muted'
  label: string
}) {
  const styles = {
    success: 'bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/40',
    warn:    'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/40',
    danger:  'bg-[var(--color-danger)]/20 text-[var(--color-danger)] border-[var(--color-danger)]/40',
    info:    'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/40',
    muted:   'bg-white/5 text-[var(--color-ink-3)] border-white/10',
  }[state]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
      styles
    )}>
      {label}
    </span>
  )
}

/** Decoraciones flotantes opcionales (emojis con animación). */
export function FloatingDecor({ emojis }: { emojis: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {emojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-3xl opacity-30 float"
          style={{
            top: `${(i * 17) % 90}%`,
            left: `${(i * 31) % 90}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  )
}
