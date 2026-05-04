import { createClient } from '@/lib/supabase/server'
import { getChallenge } from '@/lib/utils/challenge'
import { redirect } from 'next/navigation'
import { CheckpointForm } from './checkpoint-form'
import { PageHeader } from '@/components/ui'

export default async function CheckpointPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const challenge = await getChallenge()
  const { data: existing } = await supabase
    .from('checkpoints')
    .select('*')
    .eq('participant_id', user.id)
    .order('cp_number')

  return (
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-3xl mx-auto w-full space-y-8">
      <PageHeader
        eyebrow="📊 Checkpoints de Insights"
        title="Cada 14 días, sube tus métricas"
        subtitle="Alcance e interacciones de los últimos 14 días + el link de Drive con las capturas. Cada uno suma puntos al ranking."
      />

      <div className="space-y-5">
        {[1, 2, 3].map((n) => {
          const date = n === 1 ? challenge.checkpoint_1
                     : n === 2 ? challenge.checkpoint_2
                               : challenge.checkpoint_3
          const cp = existing?.find((c) => c.cp_number === n) ?? null
          return (
            <CheckpointForm
              key={n}
              cpNumber={n as 1 | 2 | 3}
              dateISO={date}
              existing={cp}
            />
          )
        })}
      </div>
    </main>
  )
}
