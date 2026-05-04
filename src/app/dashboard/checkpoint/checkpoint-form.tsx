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

export function CheckpointForm({
  cpNumber, dateISO, existing,
}: { cpNumber: 1 | 2 | 3; dateISO: string; existing: Existing }) {
  const router = useRouter()
  const [reach, setReach] = useState(existing?.reach.toString() ?? '')
  const [interactions, setInteractions] = useState(existing?.interactions.toString() ?? '')
  const [driveLink, setDriveLink] = useState(existing?.drive_link ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const colors = {
    1: { ring: 'from-[#FF1F8B]/20', label: 'CP 1', emoji: '🔥' },
    2: { ring: 'from-[#7B2CBF]/20', label: 'CP 2', emoji: '⚡' },
    3: { ring: 'from-[#00E5FF]/20', label: 'CP 3', emoji: '🏆' },
  }[cpNumber]

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
    setStatus('done'); router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="card-pop p-6 relative overflow-hidden">
      <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${colors.ring} to-transparent blur-3xl`} />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{colors.emoji}</div>
            <div>
              <p className="text-xs uppercase font-bold text-[var(--color-ink-3)] tracking-wider">
                Checkpoint {cpNumber}
              </p>
              <h3 className="font-display text-xl font-black">{formatDate(dateISO)}</h3>
            </div>
          </div>
          {existing?.validated ? (
            <StatusPill state="success" label="✓ Validado" />
          ) : existing ? (
            <StatusPill state="info" label="Pendiente validación" />
          ) : (
            <StatusPill state="muted" label="Sin completar" />
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Alcance 14 días" type="number" value={reach} onChange={setReach} />
          <Field label="Interacciones 14 días" type="number" value={interactions} onChange={setInteractions} />
        </div>
        <Field
          label="Link Drive con capturas de Insights"
          placeholder="https://drive.google.com/drive/folders/..."
          value={driveLink}
          onChange={setDriveLink}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <PopButton
            type="submit"
            variant={cpNumber === 3 ? 'accent' : cpNumber === 2 ? 'secondary' : 'primary'}
            size="md"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Guardando...' : existing ? '🔄 Actualizar' : '💾 Guardar'}
          </PopButton>
          {status === 'done' && (
            <span className="text-sm text-[var(--color-success)] font-bold">✓ Guardado</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-[var(--color-danger)]">❌ {errorMsg}</span>
          )}
        </div>
      </div>
    </form>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-pop"
      />
    </label>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es', { day: '2-digit', month: 'long' })
}
