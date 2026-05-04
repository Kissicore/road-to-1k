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
    <div className="card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr>
            {['Nombre', '@IG', 'Email', 'Rubro', 'Inicio', 'Final', 'Estado', 'Rol', ''].map((h) => (
              <th key={h} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-surface-2 transition-colors">
              <td className="px-3 py-2 font-semibold text-foreground whitespace-nowrap">{r.full_name}</td>
              <td className="px-3 py-2 text-muted">@{r.instagram_handle}</td>
              <td className="px-3 py-2 text-muted text-xs">{r.email}</td>
              <td className="px-3 py-2 text-muted">{r.rubro ?? '—'}</td>
              <td className="px-3 py-2 text-right">
                <NumberCell
                  value={r.followers_initial}
                  onSave={(v) => patch(r.id, { followers_initial: v ?? 0 })}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <NumberCell
                  value={r.followers_final}
                  onSave={(v) => patch(r.id, { followers_final: v })}
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={r.state}
                  onChange={(e) => patch(r.id, { state: e.target.value as Row['state'] })}
                  className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                </select>
              </td>
              <td className="px-3 py-2">
                <select
                  value={r.role}
                  onChange={(e) => patch(r.id, { role: e.target.value as Row['role'] })}
                  className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="participant">Participante</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-3 py-2 text-right text-xs text-muted">
                {savingId === r.id ? (
                  <span className="text-primary-soft animate-pulse">guardando…</span>
                ) : (
                  <StatusPill status={r.state} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      className="w-20 bg-surface-2 border border-border rounded-lg px-2 py-1 text-right text-sm text-foreground focus:border-primary outline-none"
    />
  )
}
