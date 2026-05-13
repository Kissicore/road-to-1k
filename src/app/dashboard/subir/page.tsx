import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor, CHALLENGE_TZ_LABEL } from '@/lib/utils/challenge'
import { redirect } from 'next/navigation'
import { SubirForm } from './subir-form'
import { PageHeader } from '@/components/ui'

export default async function SubirPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const challenge = await getChallenge()
  const todayDay = dayNumberFor(new Date(), challenge.start_date, challenge.total_days)

  const { day: dayParam } = await searchParams
  const requestedDay = dayParam ? Number.parseInt(dayParam, 10) : null
  // Validamos: día en el rango del reto y no en el futuro (no se puede
  // registrar antes de que llegue ese día).
  const dayNumber =
    todayDay && requestedDay && Number.isInteger(requestedDay)
      && requestedDay >= 1 && requestedDay <= todayDay
      ? requestedDay
      : todayDay

  const isLate = dayNumber != null && todayDay != null && dayNumber < todayDay

  const { data: existing } = dayNumber
    ? await supabase
        .from('daily_submissions')
        .select('id, reel_url, observations, correction_count')
        .eq('participant_id', user.id)
        .eq('day_number', dayNumber)
        .maybeSingle()
    : { data: null }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full space-y-8 pb-24 sm:pb-10">
      <PageHeader
        eyebrow="Dashboard"
        title={dayNumber ? `Subir Reel · Día ${dayNumber}` : 'El reto aún no inicia'}
        subtitle={
          dayNumber
            ? isLate
              ? `Estás registrando un día atrasado. Pegá el link del Reel que publicaste el día ${dayNumber}.`
              : 'Pega el link del Reel publicado para registrar tu día.'
            : `Vuelve el ${challenge.start_date}.`
        }
      />
      {dayNumber ? (
        <>
          <div className="rounded-2xl bg-[var(--color-bg-2)] border border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-ink-3)] flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">🕒</span>
            <span>
              El día del reto cuenta hasta las{' '}
              <strong className="text-[var(--color-ink-2)]">23:59 {CHALLENGE_TZ_LABEL}</strong>{' '}
              (UTC-5). Después de esa hora el sistema pasa al día siguiente para todas las alumnas,
              estés donde estés.
            </span>
          </div>
          <SubirForm dayNumber={dayNumber} existing={existing ?? null} isLate={isLate} />
        </>
      ) : (
        <p className="text-muted">Vuelve el {challenge.start_date}.</p>
      )}
    </main>
  )
}
