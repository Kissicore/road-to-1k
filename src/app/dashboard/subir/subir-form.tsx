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
  const [hookPreview, setHookPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function onPickFile(f: File | null) {
    setHookFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = (e) => setHookPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else setHookPreview(null)
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
      const { error: upErr } = await supabase.storage
        .from('hooks')
        .upload(path, hookFile, { upsert: true })
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
    <form onSubmit={onSubmit} className="card-pop p-6 sm:p-8 space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-[var(--color-ink-2)] flex items-center gap-2">
          <span>🔗</span> Link del Reel publicado
        </span>
        <input
          type="url"
          required
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="input-pop"
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-bold text-[var(--color-ink-2)] flex items-center gap-2">
          <span>📸</span> Captura del primer segundo
          {existing?.hook_screenshot_path && !hookFile && (
            <span className="text-xs text-[var(--color-success)]">· ya subiste una</span>
          )}
        </span>
        <label className={`block rounded-2xl border-2 border-dashed transition cursor-pointer ${
          hookPreview
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
            : 'border-[var(--color-border)] bg-[var(--color-bg-2)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/5'
        }`}>
          {hookPreview ? (
            <div className="p-3 flex items-center gap-4">
              <img
                src={hookPreview}
                alt="Preview"
                className="w-24 h-24 rounded-xl object-cover border-2 border-[var(--color-border)]"
              />
              <div className="text-sm">
                <p className="font-bold">{hookFile?.name}</p>
                <p className="text-[var(--color-ink-3)] text-xs mt-1">
                  Toca aquí para reemplazar
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-4xl mb-2">📸</p>
              <p className="font-display font-bold">Arrastra o haz clic</p>
              <p className="text-xs text-[var(--color-ink-4)] mt-1">PNG, JPG o WebP</p>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-[var(--color-ink-2)] flex items-center gap-2">
          <span>📝</span> Observaciones <span className="text-[var(--color-ink-4)] font-normal">(opcional)</span>
        </span>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={3}
          placeholder="Algo que quieras que Andrea o el análisis sepan."
          className="input-pop resize-none"
        />
      </label>

      <PopButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'uploading' || status === 'saving'}
        className="w-full"
      >
        {status === 'uploading' ? '📤 Subiendo captura...'
          : status === 'saving' ? '💾 Guardando...'
          : existing ? '🔄 Actualizar día' : '✅ Registrar día'}
      </PopButton>

      {status === 'done' && (
        <div className="rounded-2xl bg-[var(--color-success)]/15 border-2 border-[var(--color-success)]/40 p-4 text-sm text-[var(--color-success)] text-center font-bold">
          🎉 ¡Listo! El análisis llegará en minutos.
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-2xl bg-[var(--color-danger)]/15 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]">
          ❌ {errorMsg}
        </div>
      )}
    </form>
  )
}
