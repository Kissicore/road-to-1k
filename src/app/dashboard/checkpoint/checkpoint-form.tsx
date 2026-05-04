'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Existing = {
  id: string
  reach: number
  interactions: number
  drive_link: string | null
  validated: boolean
} | null

export function CheckpointForm({
  cpNumber,
  dateISO,
  existing,
}: {
  cpNumber: 1 | 2 | 3
  dateISO: string
  existing: Existing
}) {
  const router = useRouter()
  const [reach, setReach] = useState(existing?.reach.toString() ?? '')
  const [interactions, setInteractions] = useState(existing?.interactions.toString() ?? '')
  const [driveLink, setDriveLink] = useState(existing?.drive_link ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Sesión expirada')
      setStatus('error')
      return
    }
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
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }
    setStatus('done')
    router.refresh()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-white/10 p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          Checkpoint {cpNumber} · {dateISO}
        </h3>
        {existing?.validated && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
            Validado
          </span>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Alcance 14d" type="number" value={reach} onChange={setReach} />
        <Field label="Interacciones 14d" type="number" value={interactions} onChange={setInteractions} />
      </div>
      <Field
        label="Link Drive con capturas de Insights"
        placeholder="https://drive.google.com/drive/folders/..."
        value={driveLink}
        onChange={setDriveLink}
      />
      <button
        type="submit"
        disabled={status === 'saving'}
        className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
      >
        {status === 'saving' ? 'Guardando…' : existing ? 'Actualizar' : 'Guardar'}
      </button>
      {status === 'done' && <p className="text-xs text-emerald-400">Guardado.</p>}
      {status === 'error' && <p className="text-xs text-red-400">Error: {errorMsg}</p>}
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-neutral-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/40 text-sm"
      />
    </label>
  )
}
