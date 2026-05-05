/* Componentes base del Road to 1K — estilo Kahoot premium. v2 */
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
export type StatAccent =
  | 'primary' | 'secondary' | 'accent' | 'success'
  | 'cyan' | 'gold' | 'pink' | 'lime' | 'purple'

const statAccentRing: Record<StatAccent, string> = {
  primary:   'from-[#1F8BFF] to-[#4FA1FF]',
  secondary: 'from-[#2C5BBF] to-[#4E7DDD]',
  accent:    'from-[#00E5FF] to-[#00B4D8]',
  success:   'from-[#7EE8FF] to-[#A6F0FF]',
  // alias amigables para v0
  cyan:      'from-[#00E5FF] to-[#00B4D8]',
  gold:      'from-[#FFD23F] to-[#FFB800]',
  pink:      'from-[#1F8BFF] to-[#4FA1FF]',
  lime:      'from-[#7EE8FF] to-[#A6F0FF]',
  purple:    'from-[#2C5BBF] to-[#4E7DDD]',
}

export function StatTile({
  label,
  value,
  accent = 'primary',
  hint,
}: {
  label: string
  value: ReactNode
  accent?: StatAccent
  hint?: string
}) {
  const ringClass = statAccentRing[accent]
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
  centered = false,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  centered?: boolean
}) {
  return (
    <header className={cn('space-y-2', centered && 'text-center')}>
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display font-black text-3xl text-[var(--color-ink)] leading-tight">
        {title}
      </h1>
      {subtitle && <p className={cn('text-sm text-[var(--color-ink-3)] leading-relaxed', centered && 'mx-auto max-w-2xl')}>{subtitle}</p>}
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

/** Pill estado de submission. Acepta prop `state`+`label` (control fino) o
 *  `status` (string conocido que se mapea automáticamente). */
type PillTone = 'success' | 'warn' | 'danger' | 'info' | 'muted'

const statusMap: Record<string, { tone: PillTone; label: string }> = {
  // Participant states
  pending:  { tone: 'warn',    label: 'Pendiente' },
  approved: { tone: 'success', label: 'Aprobada' },
  rejected: { tone: 'danger',  label: 'Rechazada' },
  // Submission states
  valid:        { tone: 'success', label: 'Válido' },
  invalid:      { tone: 'danger',  label: 'Inválido' },
  duplicate:    { tone: 'warn',    label: 'Duplicado' },
  pending_review: { tone: 'warn',  label: 'Por revisar' },
  // Analysis states
  idle:    { tone: 'muted',   label: 'Sin análisis' },
  queued:  { tone: 'info',    label: 'En cola' },
  running: { tone: 'info',    label: 'Analizando…' },
  done:    { tone: 'success', label: 'Listo' },
  error:   { tone: 'danger',  label: 'Error' },
  // Generic
  validated:   { tone: 'success', label: 'Validada' },
  unvalidated: { tone: 'warn',    label: 'Pendiente' },
}

const pillStyles: Record<PillTone, string> = {
  success: 'bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/40',
  warn:    'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/40',
  danger:  'bg-[var(--color-danger)]/20 text-[var(--color-danger)] border-[var(--color-danger)]/40',
  info:    'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/40',
  muted:   'bg-white/5 text-[var(--color-ink-3)] border-white/10',
}

export function StatusPill(props:
  | { state: PillTone; label: string; status?: never }
  | { status: string; state?: never; label?: string }
) {
  let tone: PillTone
  let text: string
  if ('status' in props && props.status !== undefined) {
    const mapped = statusMap[props.status] ?? { tone: 'muted', label: props.status }
    tone = mapped.tone
    text = props.label ?? mapped.label
  } else {
    tone = props.state!
    text = props.label!
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
        pillStyles[tone]
      )}
    >
      {text}
    </span>
  )
}

/** Decoraciones flotantes. Dos modos:
 *  - emojis: lista de emojis que flotan en posiciones pseudo-aleatorias
 *  - blob:   un blur radial de color (color + size en px)
 */
export function FloatingDecor(
  props:
    | { emojis: string[]; color?: never; size?: never; className?: string }
    | { color: string; size?: number; emojis?: never; className?: string }
) {
  if ('emojis' in props && props.emojis) {
    return (
      <div aria-hidden className={cn('pointer-events-none select-none absolute inset-0 overflow-hidden', props.className)}>
        {props.emojis.map((e, i) => (
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
  const size = props.size ?? 320
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full blur-3xl opacity-30', props.className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${props.color} 0%, transparent 70%)`,
      }}
    />
  )
}
