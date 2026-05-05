'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusPill } from '@/components/ui'

type Row = {
  id: string
  cp_number: 1 | 2 | 3
  reach: number
  interactions: number
  drive_link: string | null
  validated: boolean
  created_at: string
  updated_at: string
  participant: { id: string; full_name: string; instagram_handle: string }
}

export function CheckpointsTable({
  initial,
  cpDates,
}: {
  initial: Row[]
  cpDates: Record<number, string>
}) {
  const [rows, setRows] = useState<Row[]>(initial)
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | '1' | '2' | '3'>('all')
  const [savingId, setSavingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    if (filter === 'pending') return rows.filter((r) => !r.validated)
    if (filter === 'validated') return rows.filter((r) => r.validated)
    return rows.filter((r) => r.cp_number === Number(filter))
  }, [rows, filter])

  async function toggleValidated(id: string, current: boolean) {
    setSavingId(id)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('checkpoints')
      .update({ validated: !current })
      .eq('id', id)
      .select()
      .single()
    setSavingId(null)
    if (!error && data) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, validated: !current } : r)))
    }
  }

  async function patchMetric(id: string, field: 'reach' | 'interactions', value: number) {
    setSavingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('checkpoints').update({ [field]: value }).eq('id', id)
    setSavingId(null)
    if (!error) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>Todos · {rows.length}</FilterPill>
        <FilterPill active={filter === 'pending'} onClick={() => setFilter('pending')}>
          Pendientes · {rows.filter((r) => !r.validated).length}
        </FilterPill>
        <FilterPill active={filter === 'validated'} onClick={() => setFilter('validated')}>
          Validados · {rows.filter((r) => r.validated).length}
        </FilterPill>
        <span className="w-px bg-[var(--color-border)] mx-1" />
        <FilterPill active={filter === '1'} onClick={() => setFilter('1')}>CP 1</FilterPill>
        <FilterPill active={filter === '2'} onClick={() => setFilter('2')}>CP 2</FilterPill>
        <FilterPill active={filter === '3'} onClick={() => setFilter('3')}>CP 3</FilterPill>
      </div>

      <div className="card-pop overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[var(--color-ink-3)] uppercase text-xs tracking-wider">
            <tr>
              <th className="px-3 py-3 text-left font-bold">CP</th>
              <th className="px-3 py-3 text-left font-bold">Participante</th>
              <th className="px-3 py-3 text-right font-bold">Alcance</th>
              <th className="px-3 py-3 text-right font-bold">Interacc.</th>
              <th className="px-3 py-3 text-left font-bold">Drive</th>
              <th className="px-3 py-3 text-left font-bold">Estado</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-3 py-3">
                  <div className="font-display font-black">{r.cp_number}</div>
                  <div className="text-xs text-[var(--color-ink-4)]">
                    {formatDate(cpDates[r.cp_number])}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium">{r.participant.full_name}</div>
                  <div className="text-xs text-[var(--color-ink-3)]">@{r.participant.instagram_handle}</div>
                </td>
                <td className="px-3 py-3 text-right">
                  <NumberCell value={r.reach} onSave={(v) => patchMetric(r.id, 'reach', v)} />
                </td>
                <td className="px-3 py-3 text-right">
                  <NumberCell value={r.interactions} onSave={(v) => patchMetric(r.id, 'interactions', v)} />
                </td>
                <td className="px-3 py-3">
                  {r.drive_link ? (
                    <a
                      href={r.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent)] hover:underline text-xs"
                    >
                      📁 abrir
                    </a>
                  ) : (
                    <span className="text-[var(--color-ink-4)] text-xs">sin link</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={r.validated ? 'validated' : 'unvalidated'} />
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleValidated(r.id, r.validated)}
                    disabled={savingId === r.id}
                    className={`px-3 py-1 rounded-full text-xs font-display font-bold transition ${
                      r.validated
                        ? 'bg-white/5 text-[var(--color-ink-3)] hover:bg-white/10'
                        : 'bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)]/30'
                    }`}
                  >
                    {savingId === r.id ? '…' : r.validated ? 'Quitar validación' : '✓ Validar'}
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

function NumberCell({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(value.toString())
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = parseInt(v, 10) || 0
        if (n !== value) onSave(n)
      }}
      className="w-24 bg-[var(--color-bg-2)] border-2 border-[var(--color-border)] rounded-lg px-2 py-1 text-right text-sm focus:outline-none focus:border-[var(--color-accent)]"
    />
  )
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: '2-digit', month: 'short' })
}
