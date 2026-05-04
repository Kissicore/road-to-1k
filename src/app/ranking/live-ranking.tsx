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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, refetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (rows.length === 0) {
    return (
      <div className="card-pop p-12 text-center">
        <p className="text-5xl mb-3">⏳</p>
        <p className="font-display text-xl font-black">El ranking aún está vacío</p>
        <p className="text-sm text-[var(--color-ink-3)] mt-2">
          Se llena cuando las participantes empiecen a registrar.
        </p>
      </div>
    )
  }

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  return (
    <div className="space-y-8">
      {top3.length >= 1 && <Podium top3={top3} />}

      {rest.length > 0 && (
        <div className="card-pop p-2 sm:p-4">
          <div className="hidden sm:grid grid-cols-12 px-3 py-2 text-xs uppercase font-bold text-[var(--color-ink-3)] tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Participante</div>
            <div className="col-span-2 text-right">Seguidores</div>
            <div className="col-span-2 text-right">Alcance</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {rest.map((r) => (
              <div
                key={r.participant_id}
                className="grid grid-cols-12 px-3 py-3 items-center hover:bg-white/5 rounded-xl transition"
              >
                <div className="col-span-2 sm:col-span-1 font-display text-xl font-black text-[var(--color-ink-3)]">
                  {r.position}
                </div>
                <div className="col-span-10 sm:col-span-5">
                  <p className="font-display font-bold truncate">{r.full_name ?? '—'}</p>
                  <p className="text-xs text-[var(--color-ink-3)]">@{r.instagram_handle}</p>
                </div>
                <div className="col-span-4 sm:col-span-2 text-right font-bold">
                  +{r.followers_gained ?? 0}
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-[var(--color-ink-3)] hidden sm:block">
                  {(r.total_reach ?? 0).toLocaleString('es')}
                </div>
                <div className="col-span-4 sm:col-span-2 text-right">
                  <span className="font-display text-lg font-black text-[var(--color-accent)]">
                    {Number(r.pts_total ?? 0).toFixed(0)}
                  </span>
                  <span className="text-xs text-[var(--color-ink-3)] ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Podium({ top3 }: { top3: Row[] }) {
  // Order: silver (left), gold (center), bronze (right) — bigger center.
  const gold = top3[0]
  const silver = top3[1]
  const bronze = top3[2]
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
      {silver && <PodiumCard row={silver} medal="🥈" rank={2} height="h-44 sm:h-56" />}
      {gold && <PodiumCard row={gold} medal="🥇" rank={1} height="h-56 sm:h-72" big />}
      {bronze && <PodiumCard row={bronze} medal="🥉" rank={3} height="h-36 sm:h-44" />}
    </div>
  )
}

function PodiumCard({
  row, medal, rank, height, big,
}: { row: Row; medal: string; rank: number; height: string; big?: boolean }) {
  const gradient =
    rank === 1 ? 'from-[#FFD23F] via-[#FF1F8B] to-[#7B2CBF]' :
    rank === 2 ? 'from-[#9D4EDD] to-[#7B2CBF]' :
                 'from-[#FF4FA1] to-[#FF1F8B]'
  return (
    <div className={`card-pop p-4 sm:p-5 relative overflow-hidden ${height} flex flex-col justify-end ${big ? 'pulse-ring' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      <div className="absolute top-3 right-3 text-3xl sm:text-4xl">{medal}</div>
      <div className="relative">
        <p className="text-xs uppercase font-bold tracking-wider text-[var(--color-ink-3)]">
          #{rank}
        </p>
        <p className={`font-display font-black ${big ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} truncate`}>
          {row.full_name ?? '—'}
        </p>
        <p className="text-xs text-[var(--color-ink-3)] truncate">@{row.instagram_handle}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className={`font-display font-black ${big ? 'text-3xl sm:text-4xl' : 'text-2xl'} shimmer-text`}>
            {Number(row.pts_total ?? 0).toFixed(0)}
          </span>
          <span className="text-xs text-[var(--color-ink-3)]">pts</span>
        </div>
        <p className="text-xs text-[var(--color-ink-3)] mt-1">
          +{row.followers_gained ?? 0} seguidores
        </p>
      </div>
    </div>
  )
}
