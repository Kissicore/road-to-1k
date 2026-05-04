import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatusPill } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function AdminSubmissions() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('daily_submissions')
    .select(`
      id, day_number, reel_url, status, analysis_status, created_at,
      participant:participants!inner(full_name, instagram_handle)
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="⚡ Admin · Submissions"
        title="Reels diarios"
        subtitle="Últimas 200 submissions. Marca como inválido o duplicado si aplica."
      />

      <div className="card-pop overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[var(--color-ink-3)] uppercase text-xs tracking-wider">
            <tr>
              <th className="px-3 py-3 text-left font-bold">Fecha</th>
              <th className="px-3 py-3 text-left font-bold">Participante</th>
              <th className="px-3 py-3 text-right font-bold">Día</th>
              <th className="px-3 py-3 text-left font-bold">Reel</th>
              <th className="px-3 py-3 text-left font-bold">Estado</th>
              <th className="px-3 py-3 text-left font-bold">Análisis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(rows ?? []).map((r) => {
              const p = (r.participant as unknown) as { full_name: string; instagram_handle: string }
              return (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-3 py-3 text-[var(--color-ink-3)] text-xs">
                    {new Date(r.created_at).toLocaleString('es')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{p?.full_name}</div>
                    <div className="text-xs text-[var(--color-ink-3)]">@{p?.instagram_handle}</div>
                  </td>
                  <td className="px-3 py-3 text-right font-display font-bold">{r.day_number}</td>
                  <td className="px-3 py-3">
                    <a
                      href={r.reel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent)] hover:underline truncate max-w-xs inline-block align-middle text-xs"
                    >
                      {r.reel_url}
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill
                      state={r.status === 'valid' ? 'success' : r.status === 'invalid' ? 'danger' : 'warn'}
                      label={r.status}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill
                      state={
                        r.analysis_status === 'done' ? 'success'
                        : r.analysis_status === 'error' ? 'danger'
                        : r.analysis_status === 'idle' ? 'muted'
                        : 'info'
                      }
                      label={r.analysis_status}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
