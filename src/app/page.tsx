import { getChallenge } from '@/lib/utils/challenge'
import { PopLink, FloatingDecor, GradientCard } from '@/components/ui'

export default async function Home() {
  const challenge = await getChallenge().catch(() => null)
  return (
    <main className="flex-1 relative overflow-hidden">
      <FloatingDecor emojis={['🚀', '🔥', '⚡', '💎', '🏆', '✨', '📈', '🎯']} />

      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[var(--shadow-pop-sm)] mb-8">
          <span className="text-xl">🎬</span>
          <span className="font-display font-bold text-sm tracking-wide">
            FÓRMULA 100K · Edición {challenge?.edition_label ?? '11 de mayo'}
          </span>
        </div>

        <h1 className="font-display font-black text-6xl sm:text-8xl leading-[0.95] mb-6">
          <span className="block">Road</span>
          <span className="block shimmer-text">to 1K</span>
        </h1>

        <p className="text-xl sm:text-2xl text-[var(--color-ink-2)] max-w-2xl mx-auto mb-10 font-medium">
          42 días. 1 Reel diario. <span className="text-[var(--color-success)] font-bold">+1.000 seguidores reales</span> aplicando la metodología que ya usaron cientos de alumnas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <PopLink href="/signup" variant="primary" size="lg">
            🚀 Inscribirme al reto
          </PopLink>
          <PopLink href="/login" variant="ghost" size="lg">
            Ya estoy inscrita
          </PopLink>
          <PopLink href="/ranking" variant="accent" size="lg">
            🏆 Ver ranking
          </PopLink>
        </div>

        {challenge && (
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <GradientCard className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-[var(--color-ink-3)]">Inicio</p>
              <p className="font-display text-2xl font-black mt-2">{formatDate(challenge.start_date)}</p>
            </GradientCard>
            <GradientCard className="text-center" glow>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-[var(--color-primary)]">Inscripción hasta</p>
              <p className="font-display text-2xl font-black mt-2">{formatDate(challenge.signup_deadline)}</p>
            </GradientCard>
            <GradientCard className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-[var(--color-ink-3)]">Cierre</p>
              <p className="font-display text-2xl font-black mt-2">{formatDate(challenge.end_date)}</p>
            </GradientCard>
          </div>
        )}
      </section>

      <section className="relative max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          <Pillar
            emoji="🎯"
            title="1 Reel diario"
            text="Aplicas las 33 estructuras de FÓRMULA 100K. Subes el link y la captura del primer segundo en menos de 30 segundos."
            color="primary"
          />
          <Pillar
            emoji="🤖"
            title="Análisis automático"
            text="Cada Reel recibe un diagnóstico con score viral, gancho detectado, gatillos y sugerencias accionables."
            color="accent"
          />
          <Pillar
            emoji="🏆"
            title="Ranking en vivo"
            text="Seguidores ganados, alcance, interacciones y ventas. Compite por $300, $200, $100 USD y mentorías."
            color="success"
          />
        </div>

        <div className="mt-12 card-pop p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF1F8B]/10 via-transparent to-[#00E5FF]/10" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-accent)] mb-3">
              Premios
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-black mb-6">
              Hasta $300 USD + mentorías 1:1
            </h2>
            <div className="flex flex-wrap justify-center gap-3 text-sm font-bold">
              <Trophy place="🥇 1°" amount="$300" color="primary" />
              <Trophy place="🥈 2°" amount="$200" color="secondary" />
              <Trophy place="🥉 3°" amount="$100" color="accent" />
              <Trophy place="4° y 5°" amount="1 mes agencia" color="success" />
              <Trophy place="6° y 7°" amount="Mentoría 1:1" color="primary" />
            </div>
          </div>
        </div>
      </section>
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
    accent:  'from-[#00E5FF]/20 to-transparent',
    success: 'from-[#C7F464]/20 to-transparent',
  }[color]
  return (
    <div className="card-pop p-6 relative overflow-hidden">
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br ${ring}`} />
      <div className="relative">
        <div className="text-5xl mb-4">{emoji}</div>
        <h3 className="font-display text-xl font-black mb-2">{title}</h3>
        <p className="text-[var(--color-ink-3)] text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function Trophy({ place, amount, color }: { place: string; amount: string; color: 'primary' | 'secondary' | 'accent' | 'success' }) {
  const bg = {
    primary:   'bg-[var(--color-primary)]/15 text-[var(--color-primary-2)] border-[var(--color-primary)]/40',
    secondary: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary-2)] border-[var(--color-secondary)]/40',
    accent:    'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/40',
    success:   'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/40',
  }[color]
  return (
    <span className={`px-4 py-2 rounded-full border-2 ${bg}`}>
      <span className="opacity-80">{place}</span> · {amount}
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' }).toUpperCase()
}
