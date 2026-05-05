import { getChallenge } from '@/lib/utils/challenge'
import { PopLink, FloatingDecor, GradientCard } from '@/components/ui'

export default async function Home() {
  const challenge = await getChallenge().catch(() => null)
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-24 text-center min-h-screen overflow-hidden">
        <FloatingDecor emojis={['🎬', '🔥', '⚡', '🏆', '✨', '🚀']} />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-xs font-black uppercase tracking-widest text-[var(--color-primary-2)]">
            <span>🎬</span>
            <span>FÓRMULA 100K · Edición {challenge?.edition_label ?? '11 de mayo'}</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-6xl sm:text-8xl leading-none tracking-tight">
            <span className="shimmer-text">Road</span>
            {' '}
            <span className="text-[var(--color-ink)]">to 1K</span>
          </h1>

          <p className="text-lg text-[var(--color-ink-3)] leading-relaxed max-w-xl mx-auto">
            42 días. 1 Reel diario. +1.000 seguidores reales aplicando la metodología que ya usaron cientos de alumnas.
          </p>

          {/* CTAs */}
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

          {/* Dates */}
          {challenge && (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--color-ink-3)] pt-2">
              <span>Inicio <strong className="text-[var(--color-ink)]">{formatDate(challenge.start_date)}</strong></span>
              <span>Inscripción hasta <strong className="text-[var(--color-ink)]">{formatDate(challenge.signup_deadline)}</strong></span>
              <span>Cierre <strong className="text-[var(--color-ink)]">{formatDate(challenge.end_date)}</strong></span>
            </div>
          )}
        </div>
      </section>

      {/* ── Pilares ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-[var(--color-primary)] mb-12">Cómo funciona</p>
        <div className="grid sm:grid-cols-3 gap-6">
          <Pillar emoji="🎯" title="Gancho visual" color="primary"
            text="Análisis automático del primer segundo de cada Reel con los frameworks de FÓRMULA 100K." />
          <Pillar emoji="📊" title="Ranking en vivo" color="accent"
            text="Posición calculada con seguidores ganados, alcance, interacciones y ventas en tiempo real." />
          <Pillar emoji="🔥" title="42 días de disciplina" color="success"
            text="Un Reel diario. Sin excusas. El streak te mantiene en el juego y el leaderboard te desafía." />
        </div>
      </section>

      {/* ── Premios ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-[var(--color-primary)] mb-12">Premios</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Trophy place="🥇 1er lugar" amount="Premio principal de Andrea" color="primary" />
          <Trophy place="🥈 2do lugar" amount="Reconocimiento especial" color="secondary" />
          <Trophy place="🥉 3er lugar" amount="Reconocimiento especial" color="accent" />
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative px-6 py-32 text-center overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <h2 className="font-display font-black text-4xl text-[var(--color-ink)] leading-tight">
            ¿Estás lista para los 42 días?
          </h2>
          <PopLink href="/signup" variant="primary" size="lg">
            Quiero inscribirme
          </PopLink>
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

function Pillar({
  emoji,
  title,
  text,
  color,
}: {
  emoji: string
  title: string
  text: string
  color: 'primary' | 'accent' | 'success'
}) {
  const ring = {
    primary: 'from-[#FF1F8B]/20 to-transparent',
    accent: 'from-[#00E5FF]/20 to-transparent',
    success: 'from-[#C7F464]/20 to-transparent',
  }[color]
  return (
    <div className={`card-pop p-6 bg-gradient-to-br ${ring} space-y-3`}>
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <h3 className="font-display font-bold text-lg text-[var(--color-ink)]">{title}</h3>
      <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">{text}</p>
    </div>
  )
}

function Trophy({ place, amount, color }: { place: string; amount: string; color: 'primary' | 'secondary' | 'accent' | 'success' }) {
  const bg = {
    primary: 'bg-[var(--color-primary)]/15 text-[var(--color-primary-2)] border-[var(--color-primary)]/40',
    secondary: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary-2)] border-[var(--color-secondary)]/40',
    accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/40',
    success: 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/40',
  }[color]
  return (
    <div className={`card-pop p-6 text-center space-y-2 flex-1 ${bg}`}>
      <p className="font-display font-black text-lg">{place}</p>
      <p className="text-sm text-[var(--color-ink-3)]">{amount}</p>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' }).toUpperCase()
}
