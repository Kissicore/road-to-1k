import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatTile } from '@/components/ui'
import { AdminRankingTable } from './ranking-table'

export const dynamic = 'force-dynamic'

export default async function AdminRanking() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('leaderboard')
    .select('*')
    .order('position')

  const top = rows?.[0]
  const median = rows && rows.length > 0
    ? rows[Math.floor(rows.length / 2)]?.pts_total
    : 0

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="Admin · Ranking"
        title="Ranking interno con desglose"
        subtitle="Vista detallada con los puntos por categoría. La tabla refresca automáticamente cuando cambian datos."
      />

      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Participantes en ranking" value={rows?.length ?? 0} accent="cyan" />
        <StatTile
          label="Puntaje #1"
          value={top ? Number(top.pts_total ?? 0).toFixed(0) : '—'}
          accent="gold"
          hint={top?.full_name ? `${top.full_name}` : undefined}
        />
        <StatTile
          label="Mediana"
          value={median ? Number(median).toFixed(0) : '—'}
          accent="purple"
          hint="puntos"
        />
      </section>

      <AdminRankingTable initial={(rows ?? []) as never[]} />

      <p className="text-xs text-[var(--color-ink-4)] leading-relaxed">
        Fórmula: 450 pts seguidores ganados + 300 pts alcance (suma 3 CPs)
        + 150 pts interacciones (suma 3 CPs) + 100 pts bonus por ventas validadas.
        Cada categoría se asigna proporcionalmente al máximo del grupo.
      </p>
    </main>
  )
}
