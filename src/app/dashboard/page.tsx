import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'
import {
  PageHeader, PopLink, StatTile, DayBadge, StreakFlame, GradientCard, StatusPill,
} from '@/components/ui'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const challenge = await getChallenge()
  const today = new Date()
  const todayDay = dayNumberFor(today, challenge.start_date, challenge.total_days)

  const [{ data: me }, { data: subs }, { data: lb }] = await Promise.all([
    supabase.from('participants').select('full_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('daily_submissions')
      .select('day_number, status, analysis_status, score:analysis_result->score_total')
      .eq('participant_id', user.id)
      .order('day_number'),
    supabase
      .from('leaderboard')
      .select('position, pts_total, followers_gained')
      .eq('participant_id', user.id)
      .maybeSingle(),
  ])

  const validSubs = (subs ?? []).filter((s) => s.status === 'valid')
  const validDays = validSubs.length
  const validSet = new Set(validSubs.map((s) => s.day_number))
  const streak = computeStreak(validSet, todayDay)
  const todayDone = todayDay ? validSet.has(todayDay) : false
  const firstName = (me?.full_name ?? '').split(' ')[0]

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          eyebrow={challenge.edition_label}
          title={
            <>
              <span className="text-[var(--color-ink-3)]">¡Hola, </span>
              <span>{firstName || 'creadora'}!</span>
            </>
          }
          subtitle={
            todayDay
              ? `Hoy es el día ${todayDay} de ${challenge.total_days}.`
              : `El reto inicia el ${formatDate(challenge.start_date)}.`
          }
        />
        {streak > 0 && <StreakFlame count={streak} />}
      </div>

      {todayDay && !todayDone && (
        <div className="card-pop p-6 bg-gradient-to-br from-[var(--color-primary)]/15 via-transparent to-[var(--color-accent)]/10 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 text-9xl opacity-10">🎬</div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-[var(--color-accent)]">
                Tu turno
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-black mt-1">
                Sube tu Reel del día {todayDay}
              </h2>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">
                30 segundos. Link + captura del primer segundo.
              </p>
            </div>
            <PopLink href="/dashboard/subir" variant="primary" size="lg">
              🚀 Subir Reel
            </PopLink>
          </div>
        </div>
      )}

      {todayDay && todayDone && (
        <div className="card-pop p-6 bg-gradient-to-br from-[var(--color-success)]/15 to-transparent">
          <div className="flex items-center gap-4">
            <div className="text-5xl">✅</div>
            <div>
              <h2 className="font-display text-2xl font-black">¡Día {todayDay} cumplido!</h2>
              <p className="text-sm text-[var(--color-ink-3)]">
                Tu Reel ya está registrado. Vuelve mañana.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="grid sm:grid-cols-3 gap-4">
        <StatTile
          label="Días registrados"
          value={`${validDays}/${challenge.total_days}`}
          accent="primary"
          hint={`${Math.round((validDays / challenge.total_days) * 100)}% del reto`}
        />
        <StatTile
          label="Posición ranking"
          value={lb?.position ? `#${lb.position}` : '—'}
          accent="accent"
          hint={lb?.pts_total != null ? `${Number(lb.pts_total).toFixed(1)} pts` : 'Sin datos aún'}
        />
        <StatTile
          label="Seguidores ganados"
          value={lb?.followers_gained?.toString() ?? '0'}
          accent="success"
          hint="vs. inicio del reto"
        />
      </section>

      <section className="card-pop p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-black">Tu calendario · 42 días</h2>
          {todayDay && (
            <span className="text-xs font-bold text-[var(--color-ink-3)]">
              Hoy: día {todayDay}
            </span>
          )}
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {Array.from({ length: challenge.total_days }, (_, i) => i + 1).map((d) => {
            const state = !todayDay
              ? 'upcoming'
              : validSet.has(d)
              ? 'done'
              : d === todayDay
              ? 'today'
              : d < todayDay
              ? 'missed'
              : 'upcoming'
            return <DayBadge key={d} day={d} state={state as 'done' | 'today' | 'upcoming' | 'missed'} />
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Últimos análisis</h2>
        </div>
        {(subs ?? []).length === 0 ? (
          <GradientCard className="text-center py-10">
            <p className="text-4xl mb-3">🎬</p>
            <p className="font-display font-bold text-lg">Aún no has subido nada</p>
            <p className="text-sm text-[var(--color-ink-3)] mt-1">
              Empieza el día 1. Cada Reel suma puntos al ranking.
            </p>
          </GradientCard>
        ) : (
          <div className="card-pop p-2 divide-y divide-[var(--color-border)]">
            {(subs ?? []).slice(-7).reverse().map((s) => (
              <div key={s.day_number} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <DayBadge
                    day={s.day_number}
                    state={s.status === 'valid' ? 'done' : 'upcoming'}
                  />
                  <div>
                    <p className="font-display font-bold">Día {s.day_number}</p>
                    <div className="flex gap-2 mt-1">
                      <StatusPill
                        state={
                          s.analysis_status === 'done' ? 'success'
                          : s.analysis_status === 'error' ? 'danger'
                          : s.analysis_status === 'idle' ? 'muted'
                          : 'info'
                        }
                        label={`análisis: ${s.analysis_status}`}
                      />
                    </div>
                  </div>
                </div>
                {typeof s.score === 'number' && (
                  <div className="text-right">
                    <p className="text-xs uppercase font-bold text-[var(--color-ink-3)]">Score</p>
                    <p className="font-display text-2xl font-black">{s.score}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function computeStreak(done: Set<number>, today: number | null): number {
  if (!today) return 0
  let n = 0
  for (let d = today; d >= 1; d--) {
    if (done.has(d)) n++
    else if (d !== today) break
  }
  return n
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'long' })
}
