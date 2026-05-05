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
  pts_followers: number | null
  pts_reach: number | null
  pts_interactions: number | null
  pts_sales: number | null
  pts_total: number | null
  position: number | null
}

export function AdminRankingTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial)

  useEffect(() => {
    const supabase = createClient()
    async function refetch() {
      const { data } = await supabase.from('leaderboard').select('*').order('position')
      if (data) setRows(data as Row[])
    }
    const channel = supabase
      .channel('admin-leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, refetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (rows.length === 0) {
    return (
      <div className="card-pop p-12 text-center">
        <p className="text-4xl mb-2">📊</p>
        <p className="font-display font-bold">El ranking aún está vacío.</p>
        <p className="text-sm text-[var(--color-ink-3)] mt-1">
          Se llena cuando las participantes empiecen a registrar.
        </p>
      </div>
    )
  }

  return (
    <div className="card-pop overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-[var(--color-ink-3)] uppercase text-xs tracking-wider">
          <tr>
            <th className="px-3 py-3 text-left font-bold">#</th>
            <th className="px-3 py-3 text-left font-bold">Participante</th>
            <th className="px-3 py-3 text-right font-bold">Seg. ganados</th>
            <th className="px-3 py-3 text-right font-bold">Alcance</th>
            <th className="px-3 py-3 text-right font-bold">Interacc.</th>
            <th className="px-3 py-3 text-right font-bold">Ventas</th>
            <th className="px-3 py-3 text-right font-bold text-[var(--color-primary)]">Pts seg</th>
            <th className="px-3 py-3 text-right font-bold text-[var(--color-secondary)]">Pts alc</th>
            <th className="px-3 py-3 text-right font-bold text-[var(--color-accent)]">Pts int</th>
            <th className="px-3 py-3 text-right font-bold text-[var(--color-success)]">Pts vta</th>
            <th className="px-3 py-3 text-right font-bold text-white">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((r) => (
            <tr key={r.participant_id} className="hover:bg-white/5">
              <td className="px-3 py-3 font-display font-black text-lg">{r.position}</td>
              <td className="px-3 py-3">
                <div className="font-medium truncate max-w-[12rem]">{r.full_name ?? '—'}</div>
                <div className="text-xs text-[var(--color-ink-3)]">@{r.instagram_handle}</div>
              </td>
              <td className="px-3 py-3 text-right">{r.followers_gained ?? 0}</td>
              <td className="px-3 py-3 text-right text-[var(--color-ink-3)]">
                {(r.total_reach ?? 0).toLocaleString('es')}
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-ink-3)]">
                {(r.total_interactions ?? 0).toLocaleString('es')}
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-ink-3)]">
                ${Number(r.total_sales_usd ?? 0).toFixed(0)}
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-primary-2)]">
                {Number(r.pts_followers ?? 0).toFixed(0)}
                <span className="text-[10px] text-[var(--color-ink-4)]">/450</span>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-secondary-2)]">
                {Number(r.pts_reach ?? 0).toFixed(0)}
                <span className="text-[10px] text-[var(--color-ink-4)]">/300</span>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-accent)]">
                {Number(r.pts_interactions ?? 0).toFixed(0)}
                <span className="text-[10px] text-[var(--color-ink-4)]">/150</span>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-success)]">
                {Number(r.pts_sales ?? 0).toFixed(0)}
                <span className="text-[10px] text-[var(--color-ink-4)]">/100</span>
              </td>
              <td className="px-3 py-3 text-right">
                <span className="font-display text-lg font-black">
                  {Number(r.pts_total ?? 0).toFixed(0)}
                </span>
                <span className="text-xs text-[var(--color-ink-4)]">/1000</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
