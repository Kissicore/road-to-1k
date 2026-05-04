'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton, StatusPill } from '@/components/ui'

type Existing = {
  id: string
  reach: number
  interactions: number
  drive_link: string | null
  validated: boolean
} | null

const gradients: Record<1 | 2 | 3, { from: string; to: string }> = {
  1: { from: '#e91e8c', to: '#ff4db8' },
  2: { from: '#00e5ff', to: '#00b4d8' },
  3: { from: '#a3e635', to: '#65a30d' },
}

export function CheckpointForm({
  cpNumber, dateISO, existing,
}: { cpNumber: 1 | 2 | 3; dateISO: string; existing: Existing }) {
  const router = useRouter()
  const [reach, setReach] = useState(existing?.reach.toString() ?? '')
  const [interactions, setInteractions] = useState(existing?.interactions.toString() ?? '')
  const [driveLink, setDriveLink] = useState(existing?.drive_link ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { from, to } = gradients[cpNumber]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setErrorMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErrorMsg('Sesión expirada'); setStatus('error'); return }

    const payload = {
      participant_id: user.id,
      cp_number: cpNumber,
      reach: parseInt(reach, 10) || 0,
      interactions: parseInt(interactions, 10) || 0,
      drive_link: driveLink.trim() || null,
    }
    const { error } = existing
      ? await supabase.from('checkpoints').update(payload).eq('id', existing.id)
      : await supabase.from('checkpoints').insert(payload)

    if (error) { setErrorMsg(error.message); setStatus('error'); return }
    setStatus('done')
    router.refresh()
  }

  return (
    <div
      className="rounded-xl p-px"
      style={{ background: `linear-gradient(135deg, ${from}55, ${to}33)` }}
    >
      <form
        onSubmit={onSubmit}
        className="bg-surface rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans font-bold text-foreground">Checkpoint {cpNumber}</p>
            <p className="text-xs text-muted">{dateISO}</p>
          </div>
          <div className="flex items-center gap-2">
            {existing?.validated && (
              <span className="pill pill-green">Validado</span>
            )}
            {existing && !existing.validated && (
              <span className="pill pill-amber">Pendiente</span>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Alcance 14d</span>
            <input type="number" value={reach} onChange={(e) => setReach(e.target.value)} className="input" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Interacciones 14d</span>
            <input type="number" value={interactions} onChange={(e) => setInteractions(e.target.value)} className="input" />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Link Drive con capturas de Insights</span>
          <input
            type="url"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="input"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="btn-primary px-6 py-2 text-sm"
          >
            {status === 'saving' ? 'Guardando…' : existing ? 'Actualizar' : 'Guardar checkpoint'}
          </button>
          {status === 'done' && <span className="text-xs text-lime font-semibold">Guardado.</span>}
          {status === 'error' && <span className="text-xs text-red-400">Error: {errorMsg}</span>}
        </div>
      </form>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'long' })
}
