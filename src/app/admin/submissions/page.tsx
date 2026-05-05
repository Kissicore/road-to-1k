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
    <main className="px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Submissions diarias"
        subtitle="Últimas 200 entradas. Revisa el estado de cada reel."
      />

      <div className="card-pop p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)]">
            <tr>
              {['Fecha', 'Participante', 'Día', 'Reel', 'Estado', 'Análisis'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(rows ?? []).map((r) => {
              const p = (r.participant as unknown) as { full_name: string; instagram_handle: string }
              return (
                <tr key={r.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-ink-4)] text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('es')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--color-ink)]">{p?.full_name}</div>
                    <div className="text-xs text-[var(--color-ink-4)]">@{p?.instagram_handle}</div>
                  </td>
                  <td className="px-4 py-3 font-display font-black text-[var(--color-ink)]">
                    {r.day_number}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <a
                      href={r.reel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent)] hover:underline truncate block text-xs"
                    >
                      {r.reel_url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.analysis_status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(rows ?? []).length === 0 && (
          <p className="text-center py-12 text-[var(--color-ink-4)] text-sm">
            No hay submissions aún.
          </p>
        )}
      </div>
    </main>
  )
}
