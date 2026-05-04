import { createClient } from '@/lib/supabase/server'

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
    <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Submissions diarias</h1>
        <p className="text-neutral-400 text-sm">
          Últimas 200. Marca como inválido o duplicado si aplica.
        </p>
      </header>

      <div className="rounded-lg border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-neutral-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Participante</th>
              <th className="px-3 py-2 text-right">Día</th>
              <th className="px-3 py-2 text-left">Reel</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Análisis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {(rows ?? []).map((r) => {
              const p = (r.participant as unknown) as { full_name: string; instagram_handle: string }
              return (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-3 py-2 text-neutral-400 text-xs">
                    {new Date(r.created_at).toLocaleString('es')}
                  </td>
                  <td className="px-3 py-2">
                    <div>{p?.full_name}</div>
                    <div className="text-xs text-neutral-500">@{p?.instagram_handle}</div>
                  </td>
                  <td className="px-3 py-2 text-right">{r.day_number}</td>
                  <td className="px-3 py-2">
                    <a
                      href={r.reel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline truncate max-w-xs inline-block align-middle"
                    >
                      {r.reel_url}
                    </a>
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.analysis_status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
