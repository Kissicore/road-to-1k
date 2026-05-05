import { getChallenge, type Challenge } from '@/lib/utils/challenge'
import { PopLink, FloatingDecor, GradientCard, StatTile, DayBadge } from '@/components/ui'

// Datos oficiales del reto (BASES — 11 de mayo). Sirven como fallback si la
// configuración en Supabase aún no está publicada.
const FALLBACK: Challenge = {
  id: 1,
  edition_label: '11 de mayo',
  start_date: '2026-05-11',
  end_date: '2026-06-21',
  total_days: 42,
  checkpoint_1: '2026-05-24',
  checkpoint_2: '2026-06-07',
  checkpoint_3: '2026-06-21',
  signup_deadline: '2026-05-10',
}

const ANNOUNCEMENT_DATE = '2026-06-22'
const PRIZES_DEADLINE = '2026-06-26'

export default async function Home() {
  const challenge = (await getChallenge().catch(() => null)) ?? FALLBACK
  const total = challenge.total_days ?? 42

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center min-h-[88vh] overflow-hidden">
        <FloatingDecor emojis={['🎬', '🔥', '⚡', '🏆', '✨', '🚀', '💸', '📈']} />

        <div className="relative z-10 max-w-3xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-xs font-black uppercase tracking-widest text-[var(--color-primary-2)]">
            <span>🎬</span>
            <span>FÓRMULA 100K · Edición {challenge.edition_label}</span>
          </div>

          <h1 className="font-display font-black text-6xl sm:text-8xl leading-none tracking-tight">
            <span className="shimmer-text">Road</span>{' '}
            <span className="text-[var(--color-ink)]">to 1K</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed max-w-2xl mx-auto">
            <strong className="text-[var(--color-ink)]">{total} días.</strong>{' '}
            <strong className="text-[var(--color-primary-2)]">1 Reel diario.</strong>{' '}
            Aplicas la metodología FÓRMULA 100K, registras tus métricas y compites por
            <strong className="text-[var(--color-success)]"> $600 USD en cash + servicio de agencia</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PopLink href="/signup" variant="primary" size="lg">
              🚀 Inscribirme al reto
            </PopLink>
            <PopLink href="/login" variant="ghost" size="lg">
              Ya estoy inscrita
            </PopLink>
            <PopLink href="/ranking" variant="ghost" size="lg">
              🏆 Ver ranking
            </PopLink>
          </div>

          {/* Fechas clave en formato chip */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <DateChip label="Inscripción hasta" date={challenge.signup_deadline} accent="warning" />
            <DateChip label="Inicio" date={challenge.start_date} accent="primary" />
            <DateChip label="Cierre" date={challenge.end_date} accent="accent" />
            <DateChip label="Ganadores" date={ANNOUNCEMENT_DATE} accent="success" />
          </div>
        </div>
      </section>

      {/* ── ¿Qué es el reto? · 3 pilares ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <SectionTitle eyebrow="Cómo funciona" title="Un reto. Tres reglas." />
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          <Pillar
            number="1"
            emoji="🎬"
            title="1 Reel cada día"
            color="primary"
            text={`Publicas un Reel en tu cuenta principal de Instagram durante ${total} días seguidos, sin saltarte ninguno. Reciclar está permitido sólo si remasterizas el video.`}
          />
          <Pillar
            number="2"
            emoji="📋"
            title="Registras el link en 24h"
            color="accent"
            text="Cada Reel publicado se registra en el formulario oficial dentro de 24 horas. Sin registro no cuenta como día válido del reto."
          />
          <Pillar
            number="3"
            emoji="📸"
            title="3 Checkpoints de Insights"
            color="success"
            text="En los días 14, 28 y 42 subes capturas de tus Insights de Instagram (alcance + interacciones). Esto define tu puntaje."
          />
        </div>
      </section>

      {/* ── Calendario visual ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <SectionTitle eyebrow="Calendario oficial" title={`${total} días, 4 hitos.`} />

        <div className="mt-10 space-y-4">
          <Milestone
            badge="D-1"
            title="Inscripción"
            date={challenge.signup_deadline}
            text="Te registras dejando tu nombre, usuario de Instagram y seguidores iniciales."
            accent="warning"
            icon="✍️"
          />
          <Milestone
            badge="D1"
            title="Arranque del reto"
            date={challenge.start_date}
            text="Lunes. Publicas tu primer Reel y empiezas la racha."
            accent="primary"
            icon="🚀"
          />
          <Milestone
            badge="D14"
            title="Checkpoint 1"
            date={challenge.checkpoint_1}
            text="Subes capturas de Insights: alcance e interacciones de los 14 días previos."
            accent="accent"
            icon="📊"
          />
          <Milestone
            badge="D28"
            title="Checkpoint 2"
            date={challenge.checkpoint_2}
            text="Segunda subida de Insights. Vas viendo cómo escala tu alcance."
            accent="accent"
            icon="📈"
          />
          <Milestone
            badge="D42"
            title="Checkpoint final"
            date={challenge.checkpoint_3}
            text="Último Reel + última captura de Insights. Cierras el conteo de seguidores."
            accent="success"
            icon="🏁"
          />
          <Milestone
            badge="D43"
            title="Anuncio de ganadoras"
            date={ANNOUNCEMENT_DATE}
            text="Andrea anuncia el podio. Premios se entregan hasta el 26/06/2026."
            accent="primary"
            icon="🏆"
          />
        </div>
      </section>

      {/* ── Sistema de puntos ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <SectionTitle
          eyebrow="Cómo se decide"
          title="1.000 puntos en juego."
          subtitle="Tu posición no la decide una métrica suelta — es un ranking ponderado por categorías. El primero de cada categoría se lleva el máximo; el resto recibe puntaje proporcional."
        />

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          <ScoreBar
            emoji="👥"
            label="Seguidores ganados"
            sub="Finales − Iniciales (criterio principal)"
            points={450}
            color="primary"
          />
          <ScoreBar
            emoji="📡"
            label="Alcance"
            sub="Suma de los 3 checkpoints"
            points={300}
            color="accent"
          />
          <ScoreBar
            emoji="💬"
            label="Interacciones"
            sub="Likes, comentarios, compartidos · 3 checkpoints"
            points={150}
            color="secondary"
          />
          <ScoreBar
            emoji="💸"
            label="Bonus por venta"
            sub="Evidencia de Stripe / Hotmart / PayPal / Yape / transferencia"
            points={100}
            color="success"
            isBonus
          />
        </div>
      </section>

      {/* ── Premios ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <SectionTitle eyebrow="Premios" title="7 lugares premiados." />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
          <PrizeCard place="🥇 1er lugar" prize="$300 USD" tone="gold" big />
          <PrizeCard place="🥈 2do lugar" prize="$200 USD" tone="silver" big />
          <PrizeCard place="🥉 3er lugar" prize="$100 USD" tone="bronze" big />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <PrizeCard place="4° lugar" prize="1 mes de agencia" tone="purple" />
          <PrizeCard place="5° lugar" prize="1 mes de agencia" tone="purple" />
          <PrizeCard place="6° lugar" prize="Reunión 1 a 1" tone="cyan" />
          <PrizeCard place="7° lugar" prize="Reunión 1 a 1" tone="cyan" />
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <GradientCard className="p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-success)] mb-1">💵 Pago</p>
            <p className="text-sm text-[var(--color-ink-2)]">
              <strong>Extranjeras:</strong> PayPal · <strong>Perú:</strong> transferencia bancaria.
              Entrega máximo 26/06/2026.
            </p>
          </GradientCard>
          <GradientCard className="p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] mb-1">⚖️ Desempate</p>
            <p className="text-sm text-[var(--color-ink-2)]">
              Seguidores ganados · vistas a 48h · comentarios a 48h · promedio de vistas por Reel.
            </p>
          </GradientCard>
        </div>
      </section>

      {/* ── Reglas clave ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <SectionTitle eyebrow="Reglas que importan" title="Lee esto antes de inscribirte." />

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <Rule emoji="📱" title="Una sola cuenta">
            La cuenta declarada al inscribirte es la única válida. Una participante = una cuenta principal de Instagram.
          </Rule>
          <Rule emoji="⏱️" title="Registro en 24 horas">
            Cada Reel se registra en el formulario oficial dentro de las 24h posteriores a publicar. Si no, no cuenta.
          </Rule>
          <Rule emoji="♻️" title="Remasterizar sí, repostear no">
            Puedes reutilizar una idea si la regrabas o reeditas distinta. Reposts crudos quedan fuera.
          </Rule>
          <Rule emoji="🚫" title="Cero manipulación">
            Compra de seguidores, engagement artificial o trampas = descalificación inmediata. Andrea puede pedir evidencia adicional.
          </Rule>
        </div>
      </section>

      {/* ── Stats rápidas ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Días" value={total} accent="pink" hint="consecutivos" />
          <StatTile label="Reels" value={total} accent="cyan" hint="uno por día" />
          <StatTile label="Checkpoints" value={3} accent="lime" hint="cada 14 días" />
          <StatTile label="Premios" value={7} accent="gold" hint="lugares ganadores" />
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative px-6 py-28 text-center overflow-hidden">
        <FloatingDecor color="#FF1F8B" size={520} className="left-1/2 -translate-x-1/2 top-10" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="font-display font-black text-4xl sm:text-5xl text-[var(--color-ink)] leading-tight">
            ¿Estás lista para los <span className="shimmer-text">{total} días</span>?
          </h2>
          <p className="text-base text-[var(--color-ink-3)]">
            Inscripciones abiertas hasta el {formatLong(challenge.signup_deadline)}. El reto arranca el {formatLong(challenge.start_date)}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PopLink href="/signup" variant="primary" size="lg">
              Quiero mi cupo
            </PopLink>
            <PopLink href="/ranking" variant="ghost" size="lg">
              Ver ranking en vivo
            </PopLink>
          </div>
        </div>
      </section>

      {/* ── Footer gestor ── */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6 flex items-center justify-center">
        <a
          href="/gestor"
          className="text-xs text-[var(--color-ink-4)] hover:text-[var(--color-ink-3)] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5l3.09 6.26L22.5 9l-5.25 5.12 1.24 7.23L12 18.27l-6.49 3.08 1.24-7.23L1.5 9l7.41-1.24L12 1.5z" />
          </svg>
          Gestor de reto
        </a>
      </footer>
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

function DateChip({
  label,
  date,
  accent,
}: {
  label: string
  date: string
  accent: 'primary' | 'accent' | 'success' | 'warning'
}) {
  const tone: Record<string, string> = {
    primary: 'border-[var(--color-primary)]/40 text-[var(--color-primary-2)]',
    accent: 'border-[var(--color-accent)]/40 text-[var(--color-accent)]',
    success: 'border-[var(--color-success)]/40 text-[var(--color-success)]',
    warning: 'border-[var(--color-warning)]/40 text-[var(--color-warning)]',
  }
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)]/60 border-2 text-xs font-bold ${tone[accent]}`}
    >
      <span className="uppercase tracking-wider opacity-80">{label}</span>
      <span className="text-[var(--color-ink)]">{formatShort(date)}</span>
    </span>
  )
}

function Pillar({
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
    primary: 'from-[#FF1F8B]/25 to-transparent',
    accent: 'from-[#00E5FF]/25 to-transparent',
    success: 'from-[#C7F464]/25 to-transparent',
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

function Milestone({
  badge,
  title,
  date,
  text,
  accent,
  icon,
}: {
  badge: string
  title: string
  date: string
  text: string
  accent: 'primary' | 'accent' | 'success' | 'warning'
  icon: string
}) {
  const tone: Record<string, string> = {
    primary: 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary-2)]',
    accent: 'bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-[var(--color-accent)]',
    success: 'bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]/15 border-[var(--color-warning)]/40 text-[var(--color-warning)]',
  }
  return (
    <div className="card-pop p-5 flex items-center gap-4">
      <div className={`shrink-0 w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-display font-black ${tone[accent]}`}>
        {badge}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl" aria-hidden>{icon}</span>
          <h3 className="font-display font-black text-lg text-[var(--color-ink)]">{title}</h3>
          <span className="text-xs font-bold text-[var(--color-ink-3)] uppercase tracking-wider">· {formatLong(date)}</span>
        </div>
        <p className="text-sm text-[var(--color-ink-3)] leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  )
}

function ScoreBar({
  emoji,
  label,
  sub,
  points,
  color,
  isBonus,
}: {
  emoji: string
  label: string
  sub: string
  points: number
  color: 'primary' | 'accent' | 'secondary' | 'success'
  isBonus?: boolean
}) {
  const fill = {
    primary: 'from-[#FF1F8B] to-[#FF4FA1]',
    accent: 'from-[#00E5FF] to-[#00B4D8]',
    secondary: 'from-[#9D4EDD] to-[#7B2CBF]',
    success: 'from-[#C7F464] to-[#DEFB7E]',
  }[color]
  const text = {
    primary: 'text-[var(--color-primary-2)]',
    accent: 'text-[var(--color-accent)]',
    secondary: 'text-[var(--color-secondary-2)]',
    success: 'text-[var(--color-success)]',
  }[color]
  // Ancho de la barra: max 450 sobre 1000 → 45%. Para mantener proporción visual.
  const width = Math.min((points / 450) * 100, 100)
  return (
    <div className="card-pop p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>{emoji}</span>
          <div>
            <h3 className="font-display font-black text-lg text-[var(--color-ink)]">{label}</h3>
            <p className="text-xs text-[var(--color-ink-4)]">{sub}</p>
          </div>
        </div>
        <div className={`text-right font-display font-black ${text}`}>
          <p className="text-3xl leading-none">{points}</p>
          <p className="text-[10px] uppercase tracking-widest opacity-80">{isBonus ? 'pts bonus' : 'puntos'}</p>
        </div>
      </div>
      <div className="h-3 rounded-full bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${fill} transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function PrizeCard({
  place,
  prize,
  tone,
  big,
}: {
  place: string
  prize: string
  tone: 'gold' | 'silver' | 'bronze' | 'purple' | 'cyan'
  big?: boolean
}) {
  const styles: Record<string, string> = {
    gold: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/40',
    silver: 'bg-[var(--color-ink-2)]/10 text-[var(--color-ink-2)] border-[var(--color-ink-2)]/30',
    bronze: 'bg-[var(--color-primary)]/15 text-[var(--color-primary-2)] border-[var(--color-primary)]/40',
    purple: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary-2)] border-[var(--color-secondary)]/40',
    cyan: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/40',
  }
  return (
    <div className={`card-pop ${big ? 'p-6' : 'p-4'} text-center space-y-2 ${styles[tone]}`}>
      <p className={`font-display font-black ${big ? 'text-xl' : 'text-sm'}`}>{place}</p>
      <p className={`font-display font-black ${big ? 'text-3xl' : 'text-base'} text-[var(--color-ink)]`}>{prize}</p>
    </div>
  )
}

function Rule({
  emoji,
  title,
  children,
}: {
  emoji: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card-pop p-5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>{emoji}</span>
        <h3 className="font-display font-black text-base text-[var(--color-ink)]">{title}</h3>
      </div>
      <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">{children}</p>
    </div>
  )
}

// ───────────────────────── Helpers de fecha ──────────────────────────

function formatShort(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' }).toUpperCase()
}

function formatLong(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  const s = d.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
