import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'
import { redirect } from 'next/navigation'
import { SubirForm } from './subir-form'
import { PageHeader, GradientCard } from '@/components/ui'

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
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full space-y-8">
      {todayDay ? (
        <>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/15 border-2 border-[var(--color-primary)]/40">
              <span>🎬</span>
              <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--color-primary-2)]">
                Día {todayDay} de {challenge.total_days}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black">
              Sube tu <span className="shimmer-text">Reel</span>
            </h1>
            <p className="text-[var(--color-ink-3)] max-w-md mx-auto">
              Pega el link, adjunta una captura del primer segundo y la IA te
              devuelve un diagnóstico con score viral en minutos.
            </p>
          </div>

          <SubirForm dayNumber={todayDay} existing={existing ?? null} />

          <GradientCard className="text-sm">
            <p className="font-display font-bold mb-2">💡 Tip rápido</p>
            <p className="text-[var(--color-ink-3)] leading-relaxed">
              Pausa el video al segundo 1 y captura esa pantalla. Es lo que
              evalúa el gancho visual: protagonista, carga cognitiva, contraste
              y forma visual usada.
            </p>
          </GradientCard>
        </>
      ) : (
        <>
          <PageHeader
            title="El reto aún no inicia"
            subtitle={`Vuelve el ${challenge.start_date} para subir el Reel del día 1.`}
          />
        </>
      )}
    </main>
  )
}
