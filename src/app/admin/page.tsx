import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatTile, GradientCard, StatusPill } from '@/components/ui'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const supabase = await createClient()
  const challenge = await getChallenge()
  const today = new Date()
  const todayDay = dayNumberFor(today, challenge.start_date, challenge.total_days)

  // Métricas en paralelo
  const [
    { count: total },
    { count: pending },
    { count: approved },
    { count: subsToday },
    { count: subsTotal },
    { count: cpPending },
    { count: salesPending },
    { data: missingToday },
    { data: lastSubs },
  ] = await Promise.all([
    supabase.from('participants').select('*', { count: 'exact', head: true }),
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('state', 'pending'),
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('state', 'approved'),
    supabase
      .from('daily_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('day_number', todayDay ?? -1),
    supabase.from('daily_submissions').select('*', { count: 'exact', head: true }).eq('status', 'valid'),
    supabase.from('checkpoints').select('*', { count: 'exact', head: true }).eq('validated', false),
    supabase.from('sales_evidence').select('*', { count: 'exact', head: true }).eq('validated', false),
    todayDay
      ? supabase.rpc('participants_missing_day', { day_num: todayDay }).then(
          (r) => r,
          () => ({ data: null })
        )
      : Promise.resolve({ data: null }),
    supabase
      .from('daily_submissions')
      .select(`
        id, day_number, created_at, status, analysis_status,
        participant:participants!inner(full_name, instagram_handle)
      `)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Fallback: si la RPC no existe todavía, calculamos en JS
  let pendingDayParticipants: { full_name: string; instagram_handle: string }[] = []
  if (todayDay) {
    const { data: approvedRows } = await supabase
      .from('participants')
      .select('id, full_name, instagram_handle')
      .eq('state', 'approved')
    const { data: doneToday } = await supabase
      .from('daily_submissions')
      .select('participant_id')
      .eq('day_number', todayDay)
    const doneSet = new Set((doneToday ?? []).map((s) => s.participant_id))
    pendingDayParticipants = (approvedRows ?? [])
      .filter((p) => !doneSet.has(p.id))
      .map(({ full_name, instagram_handle }) => ({ full_name, instagram_handle }))
  }

  const expectedToday = (approved ?? 0)
  const cumplimientoPct = expectedToday > 0
    ? Math.round(((subsToday ?? 0) / expectedToday) * 100)
    : 0

  const nextCp = (() => {
    if (!todayDay) return { label: 'Por iniciar', date: challenge.checkpoint_1 }
    if (todayDay <= 14) return { label: 'CP 1 (Día 14)', date: challenge.checkpoint_1 }
    if (todayDay <= 28) return { label: 'CP 2 (Día 28)', date: challenge.checkpoint_2 }
    if (todayDay <= 42) return { label: 'CP 3 (Día 42)', date: challenge.checkpoint_3 }
    return { label: 'Reto cerrado', date: challenge.end_date }
  })()

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full space-y-8">
      <PageHeader
        eyebrow="Panel de control"
        title="Resumen del reto"
        subtitle={
          todayDay
            ? `Hoy es el día ${todayDay} de ${challenge.total_days}. Próximo: ${nextCp.label} · ${formatDate(nextCp.date)}.`
            : `El reto inicia el ${formatDate(challenge.start_date)}.`
        }
      />

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Inscritas" value={total ?? 0} accent="cyan" hint={`${approved ?? 0} aprobadas`} />
        <StatTile label="Pendientes aprobar" value={pending ?? 0} accent="gold" />
        <StatTile label="Reels hoy" value={subsToday ?? 0} accent="pink" hint={`${cumplimientoPct}% cumplimiento`} />
        <StatTile label="Reels totales" value={subsTotal ?? 0} accent="lime" hint="válidos" />
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <GradientCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black">⚠️ Pendientes de validar</h2>
          </div>
          <div className="space-y-2">
            <PendingRow
              emoji="📊"
              label="Checkpoints sin validar"
              count={cpPending ?? 0}
              href="/admin/checkpoints"
            />
            <PendingRow
              emoji="💰"
              label="Ventas sin validar"
              count={salesPending ?? 0}
              href="/admin/ventas"
            />
            <PendingRow
              emoji="👥"
              label="Inscripciones pendientes"
              count={pending ?? 0}
              href="/admin/participants"
            />
          </div>
        </GradientCard>

        <GradientCard className="space-y-3">
          <h2 className="font-display text-lg font-black">
            🚨 No subieron hoy {todayDay ? `(día ${todayDay})` : ''}
          </h2>
          {pendingDayParticipants.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-3)]">
              {todayDay ? '🎉 ¡Todas las aprobadas registraron hoy!' : 'El reto aún no inicia.'}
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {pendingDayParticipants.slice(0, 12).map((p) => (
                <div
                  key={p.instagram_handle}
                  className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-white/5"
                >
                  <span className="font-medium truncate">{p.full_name}</span>
                  <span className="text-xs text-[var(--color-ink-3)]">@{p.instagram_handle}</span>
                </div>
              ))}
              {pendingDayParticipants.length > 12 && (
                <p className="text-xs text-[var(--color-ink-3)] pt-1">
                  + {pendingDayParticipants.length - 12} más
                </p>
              )}
            </div>
          )}
        </GradientCard>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-black">📡 Actividad reciente</h2>
          <Link
            href="/admin/submissions"
            className="text-xs font-bold text-[var(--color-accent)] hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <div className="card-pop p-2 divide-y divide-[var(--color-border)]">
          {(lastSubs ?? []).length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--color-ink-3)] text-center">
              Aún no hay submissions.
            </p>
          ) : (
            (lastSubs ?? []).map((s) => {
              const p = (s.participant as unknown) as { full_name: string; instagram_handle: string }
              return (
                <Link
                  key={s.id}
                  href={`/admin/submissions/${s.id}`}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/5 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p?.full_name}</p>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      @{p?.instagram_handle} · Día {s.day_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={s.analysis_status} />
                    <span className="text-xs text-[var(--color-ink-4)] hidden sm:inline">
                      {timeAgo(s.created_at)}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}

function PendingRow({
  emoji, label, count, href,
}: { emoji: string; label: string; count: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5"
    >
      <span className="text-sm flex items-center gap-2">
        <span>{emoji}</span>
        {label}
      </span>
      <span className={`px-3 py-0.5 rounded-full text-sm font-display font-black border-2 ${
        count > 0
          ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/40'
          : 'bg-white/5 text-[var(--color-ink-3)] border-white/10'
      }`}>
        {count}
      </span>
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}
