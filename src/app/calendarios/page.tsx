import { PopLink, FloatingDecor, GradientCard, StatTile } from '@/components/ui'

export const metadata = {
  title: 'Calendarios · Road to 1K · FÓRMULA 100K',
  description:
    '6 semanas de contenido viral con análisis F100K, pauta de gancho y prompts de guion para ejecutar el reto Road to 1K.',
}

type Week = {
  n: number
  title: string
  range: string
  blurb: string
  accent: 'primary' | 'accent' | 'success' | 'warning' | 'secondary'
  emoji: string
}

const WEEKS: Week[] = [
  {
    n: 1,
    title: 'Arranque y patrón viral',
    range: '11 — 17 mayo',
    blurb:
      'Pantalla dividida, versus, demostración rápida. Activas la racha con 7 estructuras probadas.',
    accent: 'primary',
    emoji: '🚀',
  },
  {
    n: 2,
    title: 'Identidad y autoridad',
    range: '18 — 24 mayo',
    blurb:
      'Reels de posicionamiento que filtran audiencia y construyen tu personaje en feed.',
    accent: 'accent',
    emoji: '🎬',
  },
  {
    n: 3,
    title: 'Educación con gancho',
    range: '25 — 31 mayo',
    blurb:
      'Listas, tutoriales y miniclase. Subes valor sin perder retención ni ritmo viral.',
    accent: 'success',
    emoji: '🧠',
  },
  {
    n: 4,
    title: 'Engagement profundo',
    range: '1 — 7 junio',
    blurb:
      'Reels que se comparten y se guardan. CTAs orgánicos que disparan comentarios.',
    accent: 'secondary',
    emoji: '💬',
  },
  {
    n: 5,
    title: 'Conversión suave',
    range: '8 — 14 junio',
    blurb:
      'Casos, testimonios y prueba social. Prepara la audiencia para tu oferta sin venderle.',
    accent: 'warning',
    emoji: '💸',
  },
  {
    n: 6,
    title: 'Cierre y bonus venta',
    range: '15 — 21 junio',
    blurb:
      'Última semana del reto. Cierres potentes, llamado claro y bonus por venta activado.',
    accent: 'primary',
    emoji: '🏁',
  },
]

export default function CalendariosPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center min-h-[70vh] overflow-hidden">
        <FloatingDecor emojis={['📅', '🎬', '🔥', '⚡', '✨', '📈', '🏆', '💸']} />

        <div className="relative z-10 max-w-3xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-xs font-black uppercase tracking-widest text-[var(--color-primary-2)]">
            <span>📅</span>
            <span>Extensión del reto · Road to 1K</span>
          </div>

          <h1 className="font-display font-black text-6xl sm:text-8xl leading-none tracking-tight">
            <span className="shimmer-text">Calendarios</span>{' '}
            <span className="text-[var(--color-ink)]">de contenido</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed max-w-2xl mx-auto">
            <strong className="text-[var(--color-ink)]">6 semanas.</strong>{' '}
            <strong className="text-[var(--color-primary-2)]">42 ideas virales.</strong>{' '}
            Cada día con su análisis F100K, pauta de gancho y prompt de guion listo para
            adaptar a tu nicho.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PopLink href="#semanas" variant="primary" size="lg">
              📅 Ver las 6 semanas
            </PopLink>
            <PopLink href="/" variant="ghost" size="lg">
              ← Volver al reto
            </PopLink>
          </div>
        </div>
      </section>

      {/* ── Stats rápidas ── */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Semanas" value={6} accent="pink" hint="del reto" />
          <StatTile label="Ideas" value={42} accent="cyan" hint="una por día" />
          <StatTile label="Prompts" value={42} accent="lime" hint="listos para guion" />
          <StatTile label="Análisis" value="F100K" accent="gold" hint="por cada idea" />
        </div>
      </section>

      {/* ── Cómo usarlos ── */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <SectionTitle eyebrow="Cómo se usan" title="3 pasos por día." />
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          <Step
            number="1"
            emoji="🔍"
            title="Lees el análisis"
            color="primary"
            text="Cada idea trae su forma visual, sistema E.N.C., gatillo y por qué funciona. Entiendes qué la hace viral antes de copiarla."
          />
          <Step
            number="2"
            emoji="🎯"
            title="Adaptas al nicho"
            color="accent"
            text="Contestas las 4 preguntas de adaptación. Convierten la idea genérica en un Reel que solo tú podrías grabar."
          />
          <Step
            number="3"
            emoji="✍️"
            title="Generas el guion"
            color="success"
            text="Pegas el prompt en Claude o ChatGPT, completas tus variables y obtienes el guion listo para grabar."
          />
        </div>
      </section>

      {/* ── Grid de semanas ── */}
      <section id="semanas" className="px-6 py-20 max-w-6xl mx-auto scroll-mt-16">
        <SectionTitle
          eyebrow="Calendarios oficiales"
          title="Una semana, un calendario."
          subtitle="Abre cada semana en su propia pestaña. Cada calendario es independiente, descargable y se puede imprimir."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {WEEKS.map((w) => (
            <WeekCard key={w.n} week={w} />
          ))}
        </div>
      </section>

      {/* ── Recomendación de uso ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4">
          <GradientCard className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-primary-2)] mb-2">
              💡 Tip de Andrea
            </p>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
              No tienes que usar el calendario en orden. Si una idea te late más para hoy,
              salta a ella. Lo único innegociable es publicar 1 Reel diario durante los 42
              días.
            </p>
          </GradientCard>
          <GradientCard className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] mb-2">
              ♻️ Reciclar permitido
            </p>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
              Si una idea te funcionó, puedes remasterizarla en otro día con distinta
              estructura visual. Reposts crudos no cuentan; nuevas grabaciones sí.
            </p>
          </GradientCard>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <FloatingDecor color="#1F8BFF" size={520} className="left-1/2 -translate-x-1/2 top-10" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="font-display font-black text-4xl sm:text-5xl text-[var(--color-ink)] leading-tight">
            Tu plan de <span className="shimmer-text">42 días</span> ya está armado.
          </h2>
          <p className="text-base text-[var(--color-ink-3)]">
            Te toca grabar, registrar y subir las capturas. El contenido ya no es excusa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PopLink href="/signup" variant="primary" size="lg">
              🚀 Inscribirme al reto
            </PopLink>
            <PopLink href="/" variant="ghost" size="lg">
              ← Volver al inicio
            </PopLink>
          </div>
        </div>
      </section>
    </main>
  )
}

// ───────────────────────── Sub-componentes locales ──────────────────────────

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="text-center space-y-3 max-w-2xl mx-auto">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-primary)]">{eyebrow}</p>
      <h2 className="font-display font-black text-3xl sm:text-5xl text-[var(--color-ink)] leading-tight">{title}</h2>
      {subtitle && <p className="text-sm sm:text-base text-[var(--color-ink-3)] leading-relaxed">{subtitle}</p>}
    </div>
  )
}

function Step({
  number,
  emoji,
  title,
  text,
  color,
}: {
  number: string
  emoji: string
  title: string
  text: string
  color: 'primary' | 'accent' | 'success'
}) {
  const ring = {
    primary: 'from-[#1F8BFF]/25 to-transparent',
    accent: 'from-[#00E5FF]/25 to-transparent',
    success: 'from-[#7EE8FF]/25 to-transparent',
  }[color]
  const numberColor = {
    primary: 'text-[var(--color-primary-2)]',
    accent: 'text-[var(--color-accent)]',
    success: 'text-[var(--color-success)]',
  }[color]
  return (
    <div className={`card-pop p-6 bg-gradient-to-br ${ring} space-y-3 relative`}>
      <span className={`absolute top-4 right-4 font-display font-black text-5xl opacity-20 ${numberColor}`}>{number}</span>
      <span className="text-3xl block" aria-hidden>{emoji}</span>
      <h3 className="font-display font-black text-xl text-[var(--color-ink)]">{title}</h3>
      <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">{text}</p>
    </div>
  )
}

function WeekCard({ week }: { week: Week }) {
  const tone: Record<Week['accent'], { badge: string; gradient: string; chip: string }> = {
    primary: {
      badge: 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary-2)]',
      gradient: 'from-[#1F8BFF]/20 to-transparent',
      chip: 'text-[var(--color-primary-2)]',
    },
    accent: {
      badge: 'bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-[var(--color-accent)]',
      gradient: 'from-[#00E5FF]/20 to-transparent',
      chip: 'text-[var(--color-accent)]',
    },
    success: {
      badge: 'bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]',
      gradient: 'from-[#7EE8FF]/20 to-transparent',
      chip: 'text-[var(--color-success)]',
    },
    secondary: {
      badge: 'bg-[var(--color-secondary)]/15 border-[var(--color-secondary)]/40 text-[var(--color-secondary-2)]',
      gradient: 'from-[#4E7DDD]/20 to-transparent',
      chip: 'text-[var(--color-secondary-2)]',
    },
    warning: {
      badge: 'bg-[var(--color-warning)]/15 border-[var(--color-warning)]/40 text-[var(--color-warning)]',
      gradient: 'from-[#FFD23F]/20 to-transparent',
      chip: 'text-[var(--color-warning)]',
    },
  }
  const t = tone[week.accent]

  return (
    <a
      href={`/calendarios/semana-${week.n}.html`}
      target="_blank"
      rel="noopener noreferrer"
      className={`card-pop p-6 bg-gradient-to-br ${t.gradient} space-y-4 relative block group hover:translate-y-[-4px] transition-transform`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-display font-black text-2xl ${t.badge}`}>
          {week.n}
        </div>
        <span className="text-3xl" aria-hidden>{week.emoji}</span>
      </div>

      <div className="space-y-1">
        <p className={`text-xs font-black uppercase tracking-widest ${t.chip}`}>
          Semana {week.n} · {week.range}
        </p>
        <h3 className="font-display font-black text-xl text-[var(--color-ink)] leading-tight">
          {week.title}
        </h3>
      </div>

      <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">
        {week.blurb}
      </p>

      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--color-ink-4)] uppercase tracking-wider">
          7 ideas · 7 prompts
        </span>
        <span className={`font-display font-black text-sm ${t.chip} group-hover:translate-x-1 transition-transform inline-flex items-center gap-1`}>
          Abrir →
        </span>
      </div>
    </a>
  )
}
