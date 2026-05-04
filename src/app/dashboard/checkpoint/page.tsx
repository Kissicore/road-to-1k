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

  const cpDates = [challenge.checkpoint_1, challenge.checkpoint_2, challenge.checkpoint_3]

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full space-y-8 pb-24 sm:pb-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Checkpoints de Insights"
        subtitle="Cada 14 días sube tu alcance, interacciones y el link de Drive con las capturas."
      />

      <div className="space-y-5">
        {([1, 2, 3] as const).map((n) => {
          const cp = existing?.find((c) => c.cp_number === n) ?? null
          return (
            <CheckpointForm
              key={n}
              cpNumber={n}
              dateISO={cpDates[n - 1]}
              existing={cp}
            />
          )
        })}
      </div>
    </main>
  )
}
