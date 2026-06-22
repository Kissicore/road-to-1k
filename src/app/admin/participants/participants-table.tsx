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
  followers_evidence_path: string | null
  followers_updated_at: string | null
  evidence_url: string | null
  role: 'participant' | 'admin'
  state: 'pending' | 'approved' | 'rejected'
  created_at: string
  notes: string | null
}

const REVIEW_TAG = '[REVISAR]'

export function ParticipantsTable({ initial }: { initial: Row[] }) {
  const sorted = [...initial].sort((a, b) => {
    const aReview = a.notes?.startsWith(REVIEW_TAG) ? 0 : 1
    const bReview = b.notes?.startsWith(REVIEW_TAG) ? 0 : 1
    if (aReview !== bReview) return aReview - bReview
    return b.created_at.localeCompare(a.created_at)
  })
  const [rows, setRows] = useState<Row[]>(sorted)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<{ id: string; msg: string } | null>(null)
  const reviewCount = rows.filter(r => r.notes?.startsWith(REVIEW_TAG)).length

  async function patch(id: string, update: Partial<Row>) {
    setSavingId(id)
    setErrorId(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('participants')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    setSavingId(null)
    if (error || !data) {
      console.error('[participants] update failed', { id, update, error })
      const msg = error
        ? `${error.code ?? '?'} ${error.message}${error.details ? ' — ' + error.details : ''}${error.hint ? ' (hint: ' + error.hint + ')' : ''}`
        : 'sin filas devueltas (revisa RLS)'
      setErrorId({ id, msg })
      return
    }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data } as Row : r)))
  }

  return (
    <div className="space-y-3">
      {reviewCount > 0 && (
        <div className="rounded-2xl bg-[var(--color-danger)]/10 border-2 border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm font-semibold px-4 py-3">
          ⚠️ {reviewCount} {reviewCount === 1 ? 'participante necesita' : 'participantes necesitan'} revisión: completá su nombre y @IG manualmente.
        </div>
      )}
    <div className="card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr>
            {['Nombre', '@IG', 'Email', 'Rubro', 'Inicio', 'Final', 'Evidencia', 'Estado', 'Rol', ''].map((h) => (
              <th key={h} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const isReview = r.notes?.startsWith(REVIEW_TAG)
            return (
            <tr key={r.id} className={`hover:bg-surface-2 transition-colors ${isReview ? 'bg-[var(--color-danger)]/5' : ''}`}>
              <td className="px-3 py-2 font-semibold text-foreground whitespace-nowrap">
                {isReview && <span title="Revisar — inscripción incompleta" className="mr-1">⚠️</span>}
                {r.full_name}
              </td>
              <td className="px-3 py-2 text-muted">@{r.instagram_handle}</td>
              <td className="px-3 py-2 text-muted text-xs">{r.email}</td>
              <td className="px-3 py-2 text-muted">{r.rubro ?? '—'}</td>
              <td className="px-3 py-2 text-right">
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
              <td className="px-3 py-2 text-center">
                {r.evidence_url ? (
                  <a
                    href={r.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    title={r.followers_updated_at ? `Actualizado ${new Date(r.followers_updated_at).toLocaleString('es')}` : 'Ver captura'}
                  >
                    📷 Ver
                  </a>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </td>
              <td className="px-3 py-3">
                <select
                  value={r.state}
                  onChange={(e) => patch(r.id, { state: e.target.value as Row['state'] })}
                  className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
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
                  className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="participant">Participante</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-3 py-2 text-right text-xs text-muted">
                {savingId === r.id ? (
                  <span className="text-primary-soft animate-pulse">guardando…</span>
                ) : errorId?.id === r.id ? (
                  <span className="text-red-400" title={errorId.msg}>error: {errorId.msg}</span>
                ) : (
                  <StatusPill status={r.state} />
                )}
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
      className="w-20 bg-surface-2 border border-border rounded-lg px-2 py-1 text-right text-sm text-foreground focus:border-primary outline-none"
    />
  )
}
