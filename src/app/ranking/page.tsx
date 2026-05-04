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
    <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full space-y-6">
      <header className="space-y-1 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Ranking en vivo
        </p>
        <h1 className="text-3xl font-semibold">Road to 1K · Edición 11 de mayo</h1>
        <p className="text-neutral-400 text-sm">
          Posición calculada con seguidores ganados · alcance · interacciones · ventas.
        </p>
      </header>
      <LiveRanking initial={rows ?? []} />
    </main>
  )
}
