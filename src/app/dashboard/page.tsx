import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const challenge = await getChallenge()
  const today = new Date()
  const todayDay = dayNumberFor(today, challenge.start_date, challenge.total_days)

  const [{ data: subs }, { data: lb }] = await Promise.all([
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

  const validDays = (subs ?? []).filter((s) => s.status === 'valid').length

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Reto · {challenge.edition_label}
        </p>
        <h1 className="text-3xl font-semibold">Tu progreso</h1>
        {todayDay
          ? <p className="text-neutral-400">Hoy es el día {todayDay} de {challenge.total_days}.</p>
          : <p className="text-neutral-400">El reto inicia el {challenge.start_date}.</p>}
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        <Card label="Días registrados" value={`${validDays}/${challenge.total_days}`} />
        <Card label="Posición ranking" value={lb?.position ? `#${lb.position}` : '—'} />
        <Card label="Seguidores ganados" value={lb?.followers_gained?.toString() ?? '—'} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Submissions</h2>
          {todayDay && (
            <Link
              href="/dashboard/subir"
              className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200"
            >
              Subir Reel del día {todayDay}
            </Link>
          )}
        </div>
        <div className="rounded-lg border border-white/10 divide-y divide-white/10">
          {(subs ?? []).length === 0 && (
            <p className="px-4 py-6 text-neutral-500 text-sm">
              Aún no has registrado ningún Reel. Empieza el día 1.
            </p>
          )}
          {(subs ?? []).map((s) => (
            <div key={s.day_number} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>Día {s.day_number}</span>
              <span className="text-neutral-400">
                {s.status} · análisis: {s.analysis_status}
                {typeof s.score === 'number' ? ` · ${s.score}/100` : ''}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  )
}
