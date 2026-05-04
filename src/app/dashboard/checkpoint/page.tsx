import { createClient } from '@/lib/supabase/server'
import { getChallenge } from '@/lib/utils/challenge'
import { redirect } from 'next/navigation'
import { CheckpointForm } from './checkpoint-form'

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
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Checkpoints de Insights</h1>
        <p className="text-neutral-400 text-sm">
          Cada 14 días sube tu alcance, interacciones y el link de Drive con las capturas.
        </p>
      </header>

      <div className="space-y-6">
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
