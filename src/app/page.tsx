import Link from 'next/link'
import { getChallenge } from '@/lib/utils/challenge'
import { FloatingDecor } from '@/components/ui'

const pillars = [
  { icon: '🎯', title: 'Gancho visual', desc: 'Análisis automático del primer segundo de cada Reel con los frameworks de FÓRMULA 100K.' },
  { icon: '📊', title: 'Ranking en vivo', desc: 'Posición calculada con seguidores ganados, alcance, interacciones y ventas en tiempo real.' },
  { icon: '🔥', title: '42 días de disciplina', desc: 'Un Reel diario. Sin excusas. El streak te mantiene en el juego y el leaderboard te desafía.' },
]

const prizes = [
  { pos: '1°', color: '#fbbf24', label: 'Premio principal', desc: 'Premio especial de Andrea' },
  { pos: '2°', color: '#9ca3af', label: 'Segundo puesto', desc: 'Reconocimiento especial' },
  { pos: '3°', color: '#f97316', label: 'Tercer puesto', desc: 'Reconocimiento especial' },
]

export default async function Home() {
  const challenge = await getChallenge().catch(() => null)

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden min-h-[85vh]">
        {/* Ambient glows */}
        <FloatingDecor color="#e91e8c" size={500} className="-top-32 -left-32" />
        <FloatingDecor color="#00e5ff" size={400} className="-bottom-20 -right-20" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8 animate-fade-in">
          <p className="eyebrow tracking-[0.3em]">FÓRMULA 100K · Reto</p>

          <h1 className="font-sans text-6xl sm:text-7xl font-black leading-none tracking-tight text-balance">
            <span className="animate-shimmer">Road to 1K</span>
          </h1>

          <p className="text-lg text-muted leading-relaxed max-w-xl mx-auto text-pretty">
            42 días publicando 1 Reel diario con la metodología FÓRMULA 100K.
            Crecimiento medible, ranking en tiempo real y feedback automático
            sobre cada Reel que subas.
          </p>

          {challenge && (
            <div className="inline-flex flex-wrap gap-x-4 gap-y-1 justify-center text-sm text-muted border border-border rounded-full px-5 py-2">
              <span>Edición <strong className="text-foreground">{challenge.edition_label}</strong></span>
              <span>·</span>
              <span>Inicio <strong className="text-foreground">{challenge.start_date}</strong></span>
              <span>·</span>
              <span>Inscripción hasta <strong className="text-foreground">{challenge.signup_deadline}</strong></span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/signup" className="btn-primary text-base px-8 py-4">
              Inscribirme al reto
            </Link>
            <Link href="/login" className="btn-outline text-base px-8 py-4">
              Ya estoy inscrita
            </Link>
            <Link href="/ranking" className="btn-ghost text-base px-8 py-4">
              Ver ranking →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pilares ────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <p className="eyebrow text-center mb-10">Cómo funciona</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="card-glow space-y-3 hover:border-primary/50 transition-colors">
              <span className="text-3xl" aria-hidden>{p.icon}</span>
              <h3 className="font-sans font-bold text-lg text-foreground">{p.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Premios ────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <p className="eyebrow text-center mb-10">Premios</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {prizes.map((pr) => (
            <div
              key={pr.pos}
              className="rounded-xl p-px"
              style={{ background: `linear-gradient(135deg, ${pr.color}55, ${pr.color}22)` }}
            >
              <div className="bg-surface rounded-xl p-6 text-center space-y-2 h-full">
                <p className="font-sans font-black text-5xl" style={{ color: pr.color }}>{pr.pos}</p>
                <p className="font-sans font-bold text-foreground">{pr.label}</p>
                <p className="text-muted text-sm">{pr.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────── */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <FloatingDecor color="#e91e8c" size={350} className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <h2 className="font-sans font-black text-4xl text-balance text-foreground">
            ¿Estás lista para los 42 días?
          </h2>
          <Link href="/signup" className="btn-primary text-base px-10 py-4 inline-flex">
            Quiero inscribirme
          </Link>
        </div>
      </section>
    </main>
  )
}
