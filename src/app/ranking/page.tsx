import { createClient } from '@/lib/supabase/server'
import { LiveRanking } from './live-ranking'
import { PageHeader, FloatingDecor } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('leaderboard').select('*').order('position')

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full space-y-10 relative overflow-hidden">
      <FloatingDecor color="#e91e8c" size={400} className="-top-20 -right-20 z-0" />
      <FloatingDecor color="#00e5ff" size={300} className="-bottom-10 -left-10 z-0" />

      <div className="relative z-10">
        <PageHeader
          eyebrow="Ranking en vivo"
          title="Road to 1K · Edición 11 de mayo"
          subtitle="Posición calculada con seguidores ganados · alcance · interacciones · ventas."
          centered
        />
      </div>

      <div className="relative z-10">
        <LiveRanking initial={rows ?? []} />
      </div>
    </main>
  )
}
