import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatTile } from '@/components/ui'
import { CheckpointsTable } from './checkpoints-table'
import { getChallenge } from '@/lib/utils/challenge'

export const dynamic = 'force-dynamic'

export default async function AdminCheckpoints() {
  const supabase = await createClient()
  const challenge = await getChallenge()

  const { data: rows } = await supabase
    .from('checkpoints')
    .select(`
      id, cp_number, reach, interactions, drive_link, validated, created_at, updated_at,
      participant:participants!inner(id, full_name, instagram_handle)
    `)
    .order('cp_number')
    .order('created_at')

  const total = rows?.length ?? 0
  const validated = rows?.filter((r) => r.validated).length ?? 0
  const pending = total - validated

  const cpDates: Record<number, string> = {
    1: challenge.checkpoint_1,
    2: challenge.checkpoint_2,
    3: challenge.checkpoint_3,
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="Admin · Checkpoints"
        title="Validación de Insights"
        subtitle="Revisa las capturas que las participantes suben cada 14 días. Validar es lo que cuenta los puntos en el ranking."
      />

      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Total subidos" value={total} accent="cyan" />
        <StatTile label="Validados" value={validated} accent="lime" />
        <StatTile label="Pendientes" value={pending} accent="gold" />
      </section>

      <CheckpointsTable initial={(rows ?? []) as never[]} cpDates={cpDates} />
    </main>
  )
}
