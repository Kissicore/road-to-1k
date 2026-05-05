'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusPill } from '@/components/ui'

type Row = {
  id: string
  full_name: string
  email: string
  instagram_handle: string
  rubro: string | null
  followers_initial: number
  followers_final: number | null
  role: 'participant' | 'admin'
  state: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function ParticipantsTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function patch(id: string, update: Partial<Row>) {
    setSavingId(id)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('participants')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    setSavingId(null)
    if (!error && data) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data } as Row : r)))
    }
  }

  return (
    <div className="card-pop p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--color-border)]">
          <tr>
            {['Nombre', '@IG', 'Email', 'Rubro', 'Inicio', 'Final', 'Estado', 'Rol', ''].map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
              <td className="px-3 py-2 font-semibold text-[var(--color-ink)] whitespace-nowrap">{r.full_name}</td>
              <td className="px-3 py-2 text-[var(--color-ink-3)]">@{r.instagram_handle}</td>
              <td className="px-3 py-2 text-[var(--color-ink-4)] text-xs">{r.email}</td>
              <td className="px-3 py-2 text-[var(--color-ink-4)]">{r.rubro ?? '—'}</td>
              <td className="px-3 py-2">
                <NumberCell
                  value={r.followers_initial}
                  onSave={(v) => patch(r.id, { followers_initial: v ?? 0 })}
                />
              </td>
              <td className="px-3 py-2">
                <NumberCell
                  value={r.followers_final}
                  onSave={(v) => patch(r.id, { followers_final: v })}
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={r.state}
                  onChange={(e) => patch(r.id, { state: e.target.value as Row['state'] })}
                  className="bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-full px-3 py-1 text-xs font-bold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                </select>
              </td>
              <td className="px-3 py-2 hidden md:table-cell">
                <select
                  value={r.role}
                  onChange={(e) => patch(r.id, { role: e.target.value as Row['role'] })}
                  className="bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-full px-3 py-1 text-xs font-bold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="participant">Participante</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-3 py-2 text-right text-xs">
                {savingId === r.id ? (
                  <span className="text-[var(--color-accent)] animate-pulse">guardando…</span>
                ) : (
                  <StatusPill status={r.state} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-center py-12 text-[var(--color-ink-4)] text-sm">
          No hay participantes aún.
        </p>
      )}
    </div>
  )
}

function NumberCell({
  value,
  onSave,
}: {
  value: number | null
  onSave: (v: number | null) => void
}) {
  const [v, setV] = useState(value?.toString() ?? '')
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = v.trim() === '' ? null : parseInt(v, 10) || 0
        if (n !== value) onSave(n)
      }}
      className="w-24 bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-lg px-2 py-1 text-right text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
    />
  )
}
