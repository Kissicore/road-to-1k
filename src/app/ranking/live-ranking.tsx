'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = {
  participant_id: string
  full_name: string | null
  instagram_handle: string | null
  followers_gained: number | null
  total_reach: number | null
  total_interactions: number | null
  total_sales_usd: number | null
  pts_total: number | null
  position: number | null
}

export function LiveRanking({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    async function refetch() {
      const { data } = await supabase.from('leaderboard').select('*').order('position')
      if (data) setRows(data as Row[])
    }

    const channel = supabase
      .channel('leaderboard-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        refetch
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (rows.length === 0) {
    return (
      <p className="text-center text-neutral-500 py-12">
        Aún no hay datos. El ranking se llena cuando las participantes empiecen a registrar.
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-neutral-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Participante</th>
            <th className="px-4 py-3 text-right">Seguidores</th>
            <th className="px-4 py-3 text-right">Alcance</th>
            <th className="px-4 py-3 text-right">Interacciones</th>
            <th className="px-4 py-3 text-right">Ventas USD</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r) => (
            <tr key={r.participant_id} className="hover:bg-white/5">
              <td className="px-4 py-3 font-medium">{r.position ?? '—'}</td>
              <td className="px-4 py-3">
                <div>{r.full_name ?? '—'}</div>
                <div className="text-xs text-neutral-500">@{r.instagram_handle}</div>
              </td>
              <td className="px-4 py-3 text-right">{r.followers_gained ?? 0}</td>
              <td className="px-4 py-3 text-right">{r.total_reach ?? 0}</td>
              <td className="px-4 py-3 text-right">{r.total_interactions ?? 0}</td>
              <td className="px-4 py-3 text-right">${Number(r.total_sales_usd ?? 0).toFixed(0)}</td>
              <td className="px-4 py-3 text-right font-semibold">
                {Number(r.pts_total ?? 0).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
