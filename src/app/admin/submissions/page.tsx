import Link from 'next/link'
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
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="Admin · Submissions"
        title="Reels diarios"
        subtitle="Últimas 200 submissions. Haz clic en una fila para ver el análisis IA y validar."
      />

      <div className="card-pop overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[var(--color-ink-3)] uppercase text-xs tracking-wider">
            <tr>
              {['Fecha', 'Participante', 'Día', 'Reel', 'Estado', 'Análisis', ''].map((h, i) => (
                <th key={i} className="px-3 py-3 text-left font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(rows ?? []).map((r) => {
              const p = (r.participant as unknown) as { full_name: string; instagram_handle: string }
              return (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-3 py-3 text-[var(--color-ink-3)] text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('es')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{p?.full_name}</div>
                    <div className="text-xs text-[var(--color-ink-3)]">@{p?.instagram_handle}</div>
                  </td>
                  <td className="px-3 py-3 font-display font-black">{r.day_number}</td>
                  <td className="px-3 py-3 max-w-xs">
                    <a
                      href={r.reel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent)] hover:underline truncate block text-xs"
                    >
                      {r.reel_url}
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={r.analysis_status} />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/submissions/${r.id}`}
                      className="px-3 py-1 rounded-full text-xs font-display font-bold bg-white/10 hover:bg-white/20 text-white"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(rows ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--color-ink-3)]">
                  Aún no hay submissions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
