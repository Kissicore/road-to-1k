import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'
import { StatTile, DayBadge, StreakFlame, PageHeader, StatusPill } from '@/components/ui'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const challenge = await getChallenge()
  const today = new Date()
  const todayDay = dayNumberFor(today, challenge.start_date, challenge.total_days)

  const [{ data: participant }, { data: subs }, { data: lb }] = await Promise.all([
    supabase.from('participants').select('full_name, instagram_handle').eq('id', user.id).maybeSingle(),
    supabase
      .from('daily_submissions')
      .select('day_number, status, analysis_status, analysis_result')
      .eq('participant_id', user.id)
      .order('day_number'),
    supabase
      .from('leaderboard')
      .select('position, pts_total, followers_gained')
      .eq('participant_id', user.id)
      .maybeSingle(),
  ])

  const subsMap = new Map((subs ?? []).map((s) => [s.day_number, s]))
  const validDays = (subs ?? []).filter((s) => s.status === 'valid').length

  // Calculate current streak
  let streak = 0
  if (todayDay) {
    for (let d = todayDay; d >= 1; d--) {
      if (subsMap.get(d)?.status === 'valid') streak++
      else break
    }
  }

  const firstName = participant?.full_name?.split(' ')[0] ?? ''

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full space-y-10 pb-24 sm:pb-10">
      {/* Greeting */}
      <header className="space-y-3">
        <PageHeader
          eyebrow={`Reto · ${challenge.edition_label}`}
          title={`Hola, ${firstName} 👋`}
          subtitle={
            todayDay
              ? `Hoy es el día ${todayDay} de ${challenge.total_days}. ¡A publicar!`
              : `El reto inicia el ${challenge.start_date}.`
          }
        />
        {streak > 0 && <StreakFlame count={streak} />}
      </header>

      {/* Stats */}
      <section className="grid sm:grid-cols-3 gap-4">
        <StatTile
          label="Días registrados"
          value={`${validDays}/${challenge.total_days}`}
          accent="pink"
        />
        <StatTile
          label="Posición ranking"
          value={lb?.position ? `#${lb.position}` : '—'}
          accent="cyan"
        />
        <StatTile
          label="Seguidores ganados"
          value={lb?.followers_gained?.toString() ?? '—'}
          accent="lime"
        />
      </section>

      {/* 42-day calendar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-lg text-foreground">Calendario 42 días</h2>
          {todayDay && (
            <Link href="/dashboard/subir" className="btn-primary px-4 py-2 text-sm">
              + Día {todayDay}
            </Link>
          )}
        </div>
        <div className="card">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: challenge.total_days }, (_, i) => {
              const d = i + 1
              const sub = subsMap.get(d)
              const st = sub
                ? (sub.status as 'valid' | 'pending_review' | 'invalid' | 'duplicate')
                : 'empty'
              return <DayBadge key={d} day={d} status={st} />
            })}
          </div>
        </div>
      </section>

      {/* Recent submissions */}
      <section className="space-y-4">
        <h2 className="font-sans font-bold text-lg text-foreground">Últimos análisis</h2>
        <div className="card divide-y divide-border">
          {(subs ?? []).length === 0 && (
            <p className="py-6 text-muted text-sm text-center">
              Aún no has registrado ningún Reel. Empieza el día 1.
            </p>
          )}
          {(subs ?? [])
            .slice()
            .reverse()
            .slice(0, 7)
            .map((s) => {
              const score =
                s.analysis_result &&
                typeof (s.analysis_result as Record<string, unknown>)['score_total'] === 'number'
                  ? (s.analysis_result as Record<string, unknown>)['score_total']
                  : null
              return (
                <div
                  key={s.day_number}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-sans font-bold text-foreground">Día {s.day_number}</span>
                  <div className="flex items-center gap-3">
                    <StatusPill status={s.status} />
                    <StatusPill status={s.analysis_status} />
                    {typeof score === 'number' && (
                      <span className="text-gold font-bold font-sans">{score as number}/100</span>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </section>
    </main>
  )
}
