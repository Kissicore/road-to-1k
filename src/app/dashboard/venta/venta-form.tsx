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
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }
    setStatus('done')
    setAmount('')
    setEvidenceUrl('')
    setDescription('')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-white/10 p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">Monto USD</span>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-400">
            Link a evidencia (Drive, Skool, captura)
          </span>
          <input
            type="url"
            required
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-neutral-400">Descripción (opcional)</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'saving'}
        className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
      >
        {status === 'saving' ? 'Guardando…' : 'Registrar venta'}
      </button>
      {status === 'done' && <p className="text-xs text-emerald-400">Listo.</p>}
      {status === 'error' && <p className="text-xs text-red-400">Error: {errorMsg}</p>}
    </form>
  )
}
