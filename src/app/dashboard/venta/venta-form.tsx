'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function VentaForm() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('sales_evidence').insert({
      participant_id: user.id,
      amount_usd: parseFloat(amount) || 0,
      evidence_url: evidenceUrl.trim(),
      description: description.trim() || null,
    })
    if (error) { setErrorMsg(error.message); setStatus('error'); return }
    setStatus('done')
    setAmount('')
    setEvidenceUrl('')
    setDescription('')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="card-glow space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Monto USD</span>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Link a evidencia</span>
          <input
            type="url"
            required
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="input"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Descripción (opcional)</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="btn-primary px-6 py-2 text-sm"
        >
          {status === 'saving' ? 'Guardando…' : 'Registrar venta'}
        </button>
        {status === 'done' && <span className="text-xs text-lime font-semibold">Venta registrada.</span>}
        {status === 'error' && <span className="text-xs text-red-400">Error: {errorMsg}</span>}
      </div>
    </form>
  )
}
