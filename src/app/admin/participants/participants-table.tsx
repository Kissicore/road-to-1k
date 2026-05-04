'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

  async function patch(id: string, patch: Partial<Row>) {
    setSavingId(id)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('participants')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    setSavingId(null)
    if (!error && data) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data } as Row : r)))
    }
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-neutral-400 uppercase text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Nombre</th>
            <th className="px-3 py-2 text-left">@IG</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Rubro</th>
            <th className="px-3 py-2 text-right">Seg. inicio</th>
            <th className="px-3 py-2 text-right">Seg. final</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2 text-left">Rol</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-white/5">
              <td className="px-3 py-2">{r.full_name}</td>
              <td className="px-3 py-2 text-neutral-400">@{r.instagram_handle}</td>
              <td className="px-3 py-2 text-neutral-400">{r.email}</td>
              <td className="px-3 py-2">{r.rubro ?? '—'}</td>
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
                  className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs"
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
                  className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs"
                >
                  <option value="participant">Participante</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-3 py-2 text-right text-xs text-neutral-500">
                {savingId === r.id ? 'guardando…' : ''}
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
      className="w-24 bg-transparent border border-white/10 rounded px-2 py-1 text-right"
    />
  )
}
