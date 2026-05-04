'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type Existing = {
  id: string
  reel_url: string
  hook_screenshot_path: string | null
  observations: string | null
} | null

export function SubirForm({
  dayNumber, existing,
}: { dayNumber: number; existing: Existing }) {
  const router = useRouter()
  const [reelUrl, setReelUrl] = useState(existing?.reel_url ?? '')
  const [observations, setObservations] = useState(existing?.observations ?? '')
  const [hookFile, setHookFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function onFileChange(f: File | null) {
    setHookFile(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErrorMsg('Sesión expirada'); setStatus('error'); return }

    let hookPath: string | null = existing?.hook_screenshot_path ?? null
    if (hookFile) {
      setStatus('uploading')
      const ext = hookFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${user.id}/day-${dayNumber}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('hooks').upload(path, hookFile, { upsert: true })
      if (upErr) { setErrorMsg(upErr.message); setStatus('error'); return }
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

    if (error) { setErrorMsg(error.message); setStatus('error'); return }

    setStatus('done')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Reel URL */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Link del Reel publicado</span>
        <input
          type="url"
          required
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="input"
        />
      </label>

      {/* Hook screenshot drop zone */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted block">
          Captura del primer segundo{existing?.hook_screenshot_path ? ' (sube otra para reemplazar)' : ''}
        </span>
        <label
          htmlFor="hook-upload"
          className="relative flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-surface-2 cursor-pointer transition-colors overflow-hidden"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview captura" className="h-full w-full object-cover opacity-80" />
          ) : (
            <>
              <span className="text-3xl" aria-hidden>📸</span>
              <span className="text-sm text-muted">Arrastra o haz clic para subir</span>
              <span className="text-xs text-muted/60">PNG, JPG, WEBP</span>
            </>
          )}
          <input
            id="hook-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Observations */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Observaciones (opcional)</span>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={3}
          placeholder="Algo que quieras que Andrea o el análisis sepan."
          className="input"
        />
      </label>

      <PopButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'uploading' || status === 'saving'}
        className="btn-primary w-full text-base py-4"
      >
        {status === 'uploading' ? 'Subiendo captura…'
          : status === 'saving' ? 'Guardando…'
          : existing ? 'Actualizar día'
          : 'Registrar día'}
      </PopButton>

      {status === 'done' && (
        <p className="text-sm text-lime text-center font-semibold">
          Listo. El análisis automático aparecerá en tu dashboard cuando esté.
        </p>
      )}
      {status === 'error' && (
        <div className="rounded-2xl bg-[var(--color-danger)]/15 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]">
          ❌ {errorMsg}
        </div>
      )}
    </form>
  )
}
