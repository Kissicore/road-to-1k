'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusPill } from '@/components/ui'

type Row = {
  id: string
  amount_usd: number | string
  evidence_url: string
  description: string | null
  validated: boolean
  created_at: string
  participant: { id: string; full_name: string; instagram_handle: string }
}

export function VentasTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial)
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all')
  const [savingId, setSavingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    if (filter === 'pending') return rows.filter((r) => !r.validated)
    return rows.filter((r) => r.validated)
  }, [rows, filter])

  async function toggleValidated(id: string, current: boolean) {
    setSavingId(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('sales_evidence').update({ validated: !current }).eq('id', id)
    setSavingId(null)
    if (!error) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, validated: !current } : r)))
    }
  }

  async function deleteVenta(id: string) {
    if (!confirm('¿Eliminar esta evidencia? Esta acción no se puede deshacer.')) return
    setSavingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('sales_evidence').delete().eq('id', id)
    setSavingId(null)
    if (!error) setRows((rs) => rs.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
          Todas · {rows.length}
        </FilterPill>
        <FilterPill active={filter === 'pending'} onClick={() => setFilter('pending')}>
          Pendientes · {rows.filter((r) => !r.validated).length}
        </FilterPill>
        <FilterPill active={filter === 'validated'} onClick={() => setFilter('validated')}>
          Validadas · {rows.filter((r) => r.validated).length}
        </FilterPill>
      </div>

      <div className="card-pop overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[var(--color-ink-3)] uppercase text-xs tracking-wider">
            <tr>
              <th className="px-3 py-3 text-left font-bold">Fecha</th>
              <th className="px-3 py-3 text-left font-bold">Participante</th>
              <th className="px-3 py-3 text-right font-bold">Monto</th>
              <th className="px-3 py-3 text-left font-bold">Descripción</th>
              <th className="px-3 py-3 text-left font-bold">Evidencia</th>
              <th className="px-3 py-3 text-left font-bold">Estado</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-3 py-3 text-[var(--color-ink-3)] text-xs whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString('es')}
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium">{r.participant.full_name}</div>
                  <div className="text-xs text-[var(--color-ink-3)]">@{r.participant.instagram_handle}</div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-display text-lg font-black text-[var(--color-success)]">
                    ${Number(r.amount_usd).toFixed(0)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-[var(--color-ink-2)] max-w-xs truncate">
                  {r.description ?? '—'}
                </td>
                <td className="px-3 py-3">
                  <a
                    href={r.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-accent)] hover:underline text-xs"
                  >
                    📎 abrir
                  </a>
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={r.validated ? 'validated' : 'unvalidated'} />
                </td>
                <td className="px-3 py-3 text-right space-x-1 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleValidated(r.id, r.validated)}
                    disabled={savingId === r.id}
                    className={`px-2.5 py-1 rounded-full text-xs font-display font-bold transition ${
                      r.validated
                        ? 'bg-white/5 text-[var(--color-ink-3)] hover:bg-white/10'
                        : 'bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)]/30'
                    }`}
                  >
                    {r.validated ? 'Quitar' : '✓ Validar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteVenta(r.id)}
                    disabled={savingId === r.id}
                    className="px-2 py-1 rounded-full text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--color-ink-3)]">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition ${
        active
          ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/60 text-white'
          : 'bg-transparent border-[var(--color-border)] text-[var(--color-ink-3)] hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
