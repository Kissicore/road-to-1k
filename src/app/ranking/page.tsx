import { createClient } from '@/lib/supabase/server'
import { LiveRanking } from './live-ranking'

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('leaderboard')
    .select('*')
    .order('position')

  return (
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full space-y-8">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/15 border-2 border-[var(--color-accent)]/40">
          <span>🏆</span>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--color-accent)]">
            Ranking en vivo
          </span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-black">
          <span className="shimmer-text">Road to 1K</span>
        </h1>
        <p className="text-[var(--color-ink-3)] max-w-2xl mx-auto">
          Posición calculada en tiempo real con seguidores ganados, alcance, interacciones y ventas.
        </p>
      </header>
      <LiveRanking initial={rows ?? []} />
    </main>
  )
}
