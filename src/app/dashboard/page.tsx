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
      .select('day_number, status')
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
  const missedDays = todayDay
    ? Array.from({ length: todayDay - 1 }, (_, i) => i + 1).filter((d) => !validSet.has(d))
    : []

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full space-y-10 pb-24 sm:pb-10">
      {/* Greeting */}
      <header className="space-y-3">
        <PageHeader
          eyebrow={`Reto · ${challenge.edition_label}`}
          title={
            <>¡Hola, <span className="shimmer-text">{firstName || 'creadora'}</span>!</>
          }
          subtitle={
            todayDay
              ? `Hoy es el día ${todayDay} de ${challenge.total_days}.`
              : `El reto inicia el ${formatDate(challenge.start_date)}.`
          }
        />
        {streak > 0 && <StreakFlame count={streak} />}
      </header>

      {/* Today CTA */}
      {todayDay && !todayDone && (
        <GradientCard glow>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>🎬</span>
              <div>
                <p className="font-display font-black text-lg text-[var(--color-ink)]">Tu turno</p>
                <p className="text-sm text-[var(--color-ink-3)]">Sube tu Reel del día {todayDay}</p>
              </div>
            </div>
            <PopLink href="/dashboard/subir" variant="primary" size="sm">
              🚀 Subir Reel
            </PopLink>
          </div>
        </GradientCard>
      )}

      {todayDay && todayDone && (
        <div className="card-pop p-5 flex items-center gap-3 border-[var(--color-success)]/40">
          <span className="text-3xl" aria-hidden>✅</span>
          <div>
            <p className="font-display font-black text-[var(--color-success)]">¡Día {todayDay} cumplido!</p>
            <p className="text-sm text-[var(--color-ink-3)]">Tu Reel ya está registrado. Vuelve mañana.</p>
          </div>
        </div>
      )}

      {/* Días atrasados — subida tardía */}
      {missedDays.length > 0 && (
        <div className="card-pop p-5 border-[var(--color-warning)]/40 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>⏰</span>
            <div>
              <p className="font-display font-black text-[var(--color-warning)]">
                Tenés {missedDays.length} {missedDays.length === 1 ? 'día atrasado' : 'días atrasados'}
              </p>
              <p className="text-sm text-[var(--color-ink-3)]">
                Si ya publicaste el Reel en su fecha, registralo ahora.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {missedDays.slice(0, 14).map((d) => (
              <PopLink
                key={d}
                href={`/dashboard/subir?day=${d}`}
                variant="ghost"
                size="sm"
              >
                Día {d}
              </PopLink>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <section className="grid sm:grid-cols-3 gap-4">
        <StatTile label="Días registrados" value={`${validDays}/${challenge.total_days}`} accent="primary" />
        <StatTile label="Posición ranking" value={lb?.position ? `#${lb.position}` : '—'} accent="accent" />
        <StatTile label="Seguidores ganados" value={lb?.followers_gained?.toString() ?? '—'} accent="success" />
      </section>

      {/* Calendar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[var(--color-ink)]">Tu calendario · 42 días</h2>
          {todayDay && (
            <span className="text-xs font-bold text-[var(--color-ink-3)]">Hoy: día {todayDay}</span>
          )}
        </div>
        <div className="card-pop p-5">
          <div className="flex flex-wrap gap-2">
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
              // Días pasados sin reel quedan clickeables para subida tardía.
              const href = state === 'missed' ? `/dashboard/subir?day=${d}` : undefined
              return <DayBadge key={d} day={d} state={state} href={href} />
            })}
          </div>
        </div>
      </section>

      {/* Recent submissions */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-lg text-[var(--color-ink)]">Tus últimos Reels</h2>
        <div className="card-pop divide-y divide-[var(--color-border)]">
          {(subs ?? []).length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-3xl" aria-hidden>🎬</p>
              <p className="font-display font-bold text-[var(--color-ink)]">Aún no has subido nada</p>
              <p className="text-sm text-[var(--color-ink-3)]">Empieza el día 1. Cada Reel suma puntos al ranking.</p>
            </div>
          ) : (
            (subs ?? []).slice(-7).reverse().map((s) => (
              <div key={s.day_number} className="flex items-center justify-between py-3 px-5 text-sm">
                <span className="font-display font-black text-[var(--color-ink)]">Día {s.day_number}</span>
                <div className="flex items-center gap-2">
                  <StatusPill state={s.status === 'valid' ? 'success' : s.status === 'pending_review' ? 'warn' : 'danger'} label={s.status} />
                </div>
              </div>
            ))
          )}
        </div>
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
