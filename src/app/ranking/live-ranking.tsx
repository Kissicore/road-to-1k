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

const medalColors: Record<number, string> = {
  1: '#fbbf24',
  2: '#9ca3af',
  3: '#f97316',
}

const medalEmoji: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, refetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (rows.length === 0) {
    return (
      <div className="card text-center py-16 space-y-2">
        <p className="text-4xl" aria-hidden>🏆</p>
        <p className="text-muted">
          Aún no hay datos. El ranking se llena cuando las participantes empiecen a registrar.
        </p>
      </div>
    )
  }

  // Top 3 podium
  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  return (
    <div className="space-y-8">
      {/* Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* Reorder: 2nd - 1st - 3rd */}
          {[top3[1], top3[0], top3[2]].map((r, idx) => {
            if (!r) return <div key={idx} />
            const pos = r.position ?? idx + 1
            const color = medalColors[pos] ?? '#9084b4'
            const isFirst = pos === 1
            return (
              <div
                key={r.participant_id}
                className={`rounded-xl p-px flex flex-col ${isFirst ? 'order-1 sm:order-none' : ''}`}
                style={{ background: `linear-gradient(135deg, ${color}55, ${color}22)` }}
              >
                <div className="bg-surface rounded-xl p-4 text-center space-y-1 flex flex-col items-center">
                  <span className="text-2xl" aria-hidden>{medalEmoji[pos] ?? `#${pos}`}</span>
                  <p className="font-sans font-bold text-sm text-foreground leading-tight text-balance">
                    {r.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-muted">@{r.instagram_handle}</p>
                  <p
                    className="font-sans font-black text-2xl mt-1"
                    style={{ color }}
                  >
                    {Number(r.pts_total ?? 0).toFixed(0)}
                    <span className="text-xs font-normal text-muted ml-1">pts</span>
                  </p>
                  <p className="text-xs text-muted">
                    +{r.followers_gained ?? 0} seguidores
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">#</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">Participante</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">Seguidores</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">Alcance</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted hidden sm:table-cell">Interact.</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted hidden sm:table-cell">Ventas</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-primary">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const pos = r.position ?? 0
              const color = medalColors[pos]
              return (
                <tr key={r.participant_id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3 font-sans font-bold" style={color ? { color } : undefined}>
                    {color ? medalEmoji[pos] : `#${pos}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{r.full_name ?? '—'}</div>
                    <div className="text-xs text-muted">@{r.instagram_handle}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-lime">
                    +{r.followers_gained ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{r.total_reach ?? 0}</td>
                  <td className="px-4 py-3 text-right text-muted hidden sm:table-cell">
                    {r.total_interactions ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted hidden sm:table-cell">
                    ${Number(r.total_sales_usd ?? 0).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right font-sans font-black text-primary">
                    {Number(r.pts_total ?? 0).toFixed(1)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
