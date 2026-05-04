import Link from 'next/link'
import { getChallenge } from '@/lib/utils/challenge'

export default async function Home() {
  const challenge = await getChallenge().catch(() => null)
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center space-y-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          FÓRMULA 100K · Reto
        </p>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
          Road to 1K
        </h1>
        <p className="text-lg text-neutral-300">
          42 días publicando 1 Reel diario aplicando la metodología FÓRMULA 100K.
          Crecimiento medible, ranking en tiempo real y feedback automático sobre
          cada Reel que subas.
        </p>
        {challenge && (
          <div className="text-sm text-neutral-400 space-y-1">
            <p>Edición {challenge.edition_label}</p>
            <p>
              Día 1: <span className="text-neutral-200">{challenge.start_date}</span> ·
              Cierre: <span className="text-neutral-200">{challenge.end_date}</span>
            </p>
            <p>
              Inscripción abierta hasta{' '}
              <span className="text-neutral-200">{challenge.signup_deadline}</span>
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition"
          >
            Inscribirme al reto
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 transition"
          >
            Ya estoy inscrita
          </Link>
          <Link
            href="/ranking"
            className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 transition"
          >
            Ver ranking
          </Link>
        </div>
      </div>
    </main>
  )
}
