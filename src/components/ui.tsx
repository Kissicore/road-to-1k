/* Componentes base del Road to 1K — estilo Kahoot premium. */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'accent' | 'success' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  success: 'btn-success',
  ghost: 'btn-ghost',
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
    primary: 'from-[#FF1F8B] to-[#FF4FA1]',
    secondary: 'from-[#7B2CBF] to-[#9D4EDD]',
    accent: 'from-[#00E5FF] to-[#00B4D8]',
    success: 'from-[#C7F464] to-[#DEFB7E]',
  }[accent]
  return (
    <div className="card-pop p-5 space-y-1">
      <p className={cn('text-xs font-bold uppercase tracking-widest bg-gradient-to-r bg-clip-text text-transparent', ringClass)}>
        {label}
      </p>
      <p className="text-3xl font-display font-black text-[var(--color-ink)]">{value}</p>
      {hint && <p className="text-xs text-[var(--color-ink-4)]">{hint}</p>}
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
  const styles: Record<string, string> = {
    done: 'bg-[var(--color-success)] text-[var(--color-bg)] border-[#9bc83a]',
    today: 'bg-[var(--color-primary)] text-white border-[#c01670] pulse-ring',
    upcoming: 'bg-[var(--color-surface)] text-[var(--color-ink-3)] border-[var(--color-border)]',
    missed: 'bg-[var(--color-danger)] text-white border-[#cc3636] opacity-80',
  } as const
  return (
    <div
      className={cn(
        'w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-black font-display transition-all',
        styles[state]
      )}
      title={`Día ${day}`}
    >
      {day}
    </div>
  )
}

/** Llama de racha (streak). */
export function StreakFlame({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 pulse-ring w-fit">
      <span className="text-xl" aria-hidden>🔥</span>
      <span className="font-display font-black text-[var(--color-primary-2)] text-lg leading-none">{count}</span>
      <span className="text-xs text-[var(--color-ink-4)]">racha</span>
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
    <header className="space-y-2">
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display font-black text-3xl text-[var(--color-ink)] leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">{subtitle}</p>}
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
        'card-pop p-5',
        glow && 'shadow-[var(--shadow-glow)]',
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
    warn: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/40',
    danger: 'bg-[var(--color-danger)]/20 text-[var(--color-danger)] border-[var(--color-danger)]/40',
    info: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/40',
    muted: 'bg-white/5 text-[var(--color-ink-3)] border-white/10',
  }[state]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
        styles
      )}
    >
      {label}
    </span>
  )
}

/** Decoraciones flotantes opcionales (emojis con animación). */
export function FloatingDecor({ emojis }: { emojis: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none select-none absolute inset-0 overflow-hidden">
      {emojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-3xl float opacity-20"
          style={{
            left: `${10 + (i * 27) % 80}%`,
            top: `${5 + (i * 31) % 85}%`,
            animationDelay: `${i * 0.8}s`,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  )
}
