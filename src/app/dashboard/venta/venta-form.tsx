'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

export function VentaForm() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setErrorMsg(null)
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
    setAmount(''); setEvidenceUrl(''); setDescription('')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="card-pop p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wide">
            💵 Monto USD
          </span>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
            className="input-pop"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wide">
            📎 Link a evidencia
          </span>
          <input
            type="url"
            required
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="input-pop"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wide">
          📝 Descripción (opcional)
        </span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Reel del día 12 me trajo esta venta…"
          className="input-pop resize-none"
        />
      </label>
      <PopButton
        type="submit"
        variant="success"
        size="md"
        disabled={status === 'saving'}
      >
        {status === 'saving' ? 'Guardando...' : '💰 Registrar venta'}
      </PopButton>
      {status === 'done' && <p className="text-sm text-[var(--color-success)] font-bold">✓ Listo, registrada.</p>}
      {status === 'error' && <p className="text-sm text-[var(--color-danger)]">❌ {errorMsg}</p>}
    </form>
  )
}
