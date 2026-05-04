import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'
import { redirect } from 'next/navigation'
import { SubirForm } from './subir-form'

export default async function SubirPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const challenge = await getChallenge()
  const todayDay = dayNumberFor(new Date(), challenge.start_date, challenge.total_days)

  const { data: existing } = todayDay
    ? await supabase
        .from('daily_submissions')
        .select('id, reel_url, hook_screenshot_path, observations')
        .eq('participant_id', user.id)
        .eq('day_number', todayDay)
        .maybeSingle()
    : { data: null }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {todayDay ? `Subir Reel · Día ${todayDay}` : 'El reto aún no inicia'}
        </h1>
        <p className="text-neutral-400 text-sm">
          Pega el link del Reel y adjunta una captura del primer segundo. El
          análisis automático con los frameworks de FÓRMULA 100K llega en
          segundos a tu dashboard.
        </p>
      </header>

      {todayDay
        ? <SubirForm
            dayNumber={todayDay}
            existing={existing ?? null}
          />
        : <p className="text-neutral-500">Vuelve el {challenge.start_date}.</p>}
    </main>
  )
}
