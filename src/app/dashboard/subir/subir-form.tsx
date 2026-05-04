'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Existing = {
  id: string
  reel_url: string
  hook_screenshot_path: string | null
  observations: string | null
} | null

export function SubirForm({
  dayNumber,
  existing,
}: { dayNumber: number; existing: Existing }) {
  const router = useRouter()
  const [reelUrl, setReelUrl] = useState(existing?.reel_url ?? '')
  const [observations, setObservations] = useState(existing?.observations ?? '')
  const [hookFile, setHookFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Sesión expirada')
      setStatus('error')
      return
    }

    let hookPath: string | null = existing?.hook_screenshot_path ?? null
    if (hookFile) {
      setStatus('uploading')
      const ext = hookFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${user.id}/day-${dayNumber}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('hooks')
        .upload(path, hookFile, { upsert: true })
      if (upErr) {
        setErrorMsg(upErr.message)
        setStatus('error')
        return
      }
      hookPath = path
    }

    setStatus('saving')
    const payload = {
      participant_id: user.id,
      day_number: dayNumber,
      reel_url: reelUrl.trim(),
      hook_screenshot_path: hookPath,
      observations: observations.trim() || null,
      status: 'valid' as const,
      analysis_status: 'queued' as const,
    }

    const { error } = existing
      ? await supabase.from('daily_submissions').update(payload).eq('id', existing.id)
      : await supabase.from('daily_submissions').insert(payload)

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }

    setStatus('done')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm text-neutral-300">Link del Reel publicado</span>
        <input
          type="url"
          required
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/40"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-neutral-300">
          Captura del primer segundo {existing?.hook_screenshot_path ? '(ya subiste una; sube otra para reemplazar)' : ''}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setHookFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20"
        />
        <span className="text-xs text-neutral-500">
          Pausa el video al segundo 1 y sube el screenshot. Es lo que el análisis usa
          para evaluar tu gancho visual.
        </span>
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-neutral-300">Observaciones (opcional)</span>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={3}
          placeholder="Algo que quieras que Andrea o el análisis sepan."
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/40"
        />
      </label>

      <button
        type="submit"
        disabled={status === 'uploading' || status === 'saving'}
        className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50 transition"
      >
        {status === 'uploading' ? 'Subiendo captura…'
          : status === 'saving' ? 'Guardando…'
          : existing ? 'Actualizar día' : 'Registrar día'}
      </button>

      {status === 'done' && (
        <p className="text-sm text-emerald-400 text-center">
          Listo. El análisis automático aparecerá en tu dashboard cuando esté.
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Error: {errorMsg}</p>
      )}
    </form>
  )
}
