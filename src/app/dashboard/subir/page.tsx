import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'
import { redirect } from 'next/navigation'
import { SubirForm } from './subir-form'
import { PageHeader } from '@/components/ui'

export default async function SubirPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const challenge = await getChallenge()
  const todayDay = dayNumberFor(new Date(), challenge.start_date, challenge.total_days)

  const { data: existing } = todayDay
    ? await supabase
        .from('daily_submissions')
        .select('id, reel_url, observations')
        .eq('participant_id', user.id)
        .eq('day_number', todayDay)
        .maybeSingle()
    : { data: null }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full space-y-8 pb-24 sm:pb-10">
      <PageHeader
        eyebrow="Dashboard"
        title={todayDay ? `Subir Reel · Día ${todayDay}` : 'El reto aún no inicia'}
        subtitle={
          todayDay
            ? 'Pega el link del Reel publicado para registrar tu día.'
            : `Vuelve el ${challenge.start_date}.`
        }
      />
      {todayDay ? (
        <SubirForm dayNumber={todayDay} existing={existing ?? null} />
      ) : (
        <p className="text-muted">Vuelve el {challenge.start_date}.</p>
      )}
    </main>
  )
}
