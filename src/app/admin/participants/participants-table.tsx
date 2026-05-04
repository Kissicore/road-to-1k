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

  async function patch(id: string, patch: Partial<Row>) {
    setSavingId(id)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('participants').update(patch).eq('id', id).select().single()
    setSavingId(null)
    if (!error && data) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data } as Row : r)))
    }
  }

  return (
    <div className="card-pop overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-[var(--color-ink-3)] uppercase text-xs tracking-wider">
          <tr>
            <th className="px-3 py-3 text-left font-bold">Nombre</th>
            <th className="px-3 py-3 text-left font-bold">@IG</th>
            <th className="px-3 py-3 text-left font-bold hidden sm:table-cell">Email</th>
            <th className="px-3 py-3 text-left font-bold hidden md:table-cell">Rubro</th>
            <th className="px-3 py-3 text-right font-bold">Inicio</th>
            <th className="px-3 py-3 text-right font-bold">Final</th>
            <th className="px-3 py-3 text-left font-bold">Estado</th>
            <th className="px-3 py-3 text-left font-bold hidden md:table-cell">Rol</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-white/5">
              <td className="px-3 py-3 font-medium">{r.full_name}</td>
              <td className="px-3 py-3 text-[var(--color-ink-3)]">@{r.instagram_handle}</td>
              <td className="px-3 py-3 text-[var(--color-ink-3)] text-xs hidden sm:table-cell">{r.email}</td>
              <td className="px-3 py-3 hidden md:table-cell">{r.rubro ?? '—'}</td>
              <td className="px-3 py-3 text-right">
                <NumberCell
                  value={r.followers_initial}
                  onSave={(v) => patch(r.id, { followers_initial: v ?? 0 })}
                />
              </td>
              <td className="px-3 py-3 text-right">
                <NumberCell
                  value={r.followers_final}
                  onSave={(v) => patch(r.id, { followers_final: v })}
                />
              </td>
              <td className="px-3 py-3">
                <select
                  value={r.state}
                  onChange={(e) => patch(r.id, { state: e.target.value as Row['state'] })}
                  className="bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-full px-3 py-1 text-xs font-bold focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="approved">✓ Aprobada</option>
                  <option value="rejected">✗ Rechazada</option>
                </select>
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <select
                  value={r.role}
                  onChange={(e) => patch(r.id, { role: e.target.value as Row['role'] })}
                  className="bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-full px-3 py-1 text-xs font-bold focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="participant">Participante</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-3 py-3 text-right text-xs text-[var(--color-ink-4)]">
                {savingId === r.id && <StatusPill state="info" label="guardando" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NumberCell({
  value, onSave,
}: { value: number | null; onSave: (v: number | null) => void }) {
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
      className="w-24 bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-lg px-2 py-1 text-right text-sm focus:outline-none focus:border-[var(--color-accent)]"
    />
  )
}
