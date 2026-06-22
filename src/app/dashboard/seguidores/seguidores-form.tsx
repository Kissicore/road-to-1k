'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type Props = {
  followersInitial: number
  followersFinal: number | null
  evidenceUrl: string | null
  updatedAt: string | null
}

const MAX_MB = 8
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

export function SeguidoresForm({
  followersInitial, followersFinal, evidenceUrl, updatedAt,
}: Props) {
  const router = useRouter()
  const [followers, setFollowers] = useState(followersFinal?.toString() ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(evidenceUrl)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const parsed = followers.trim() === '' ? null : parseInt(followers, 10)
  const gained = parsed != null && !Number.isNaN(parsed) ? parsed - followersInitial : null

  function onPickFile(f: File | null) {
    setErrorMsg(null)
    if (!f) { setFile(null); setPreview(evidenceUrl); return }
    if (!ACCEPTED.includes(f.type)) {
      setErrorMsg('La captura debe ser PNG, JPG o WEBP.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`La captura pesa demasiado (máx ${MAX_MB} MB).`)
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (parsed == null || Number.isNaN(parsed) || parsed < 0) {
      setErrorMsg('Escribe cuántos seguidores tienes hoy (un número).')
      setStatus('error')
      return
    }
    // La captura es obligatoria la primera vez; si ya hay una guardada, es opcional.
    if (!file && !evidenceUrl) {
      setErrorMsg('Sube la captura de tu perfil que muestre tus seguidores actuales.')
      setStatus('error')
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErrorMsg('Sesión expirada'); setStatus('error'); return }

    let evidencePath: string | undefined
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      // El primer folder DEBE ser el uid — lo exige la policy de Storage (0003).
      const path = `${user.id}/followers/evidencia.${ext}`
      const { error: upErr } = await supabase
        .storage
        .from('hooks')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) {
        setErrorMsg(`No pudimos subir la captura: ${upErr.message}`)
        setStatus('error')
        return
      }
      evidencePath = path
    }

    const update: Record<string, unknown> = {
      followers_final: parsed,
      followers_updated_at: new Date().toISOString(),
    }
    if (evidencePath) update.followers_evidence_path = evidencePath

    const { error } = await supabase
      .from('participants')
      .update(update)
      .eq('id', user.id)

    if (error) { setErrorMsg(error.message); setStatus('error'); return }

    setStatus('done')
    setFile(null)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="card-pop p-6 sm:p-7 space-y-5">
      {/* Resumen ganados */}
      <div className="grid grid-cols-3 gap-3">
        <Mini label="Al iniciar" value={followersInitial.toLocaleString('es')} />
        <Mini label="Hoy" value={parsed != null && !Number.isNaN(parsed) ? parsed.toLocaleString('es') : '—'} />
        <Mini
          label="Ganados"
          value={gained != null ? (gained >= 0 ? `+${gained.toLocaleString('es')}` : gained.toLocaleString('es')) : '—'}
          accent
        />
      </div>

      {/* Seguidores actuales */}
      <label className="block space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]">
          Seguidores actuales
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={followers}
          onChange={(e) => setFollowers(e.target.value)}
          placeholder="Ej. 1240"
          className="input-pop"
        />
        <p className="text-xs text-[var(--color-ink-4)]">
          Tu total de seguidores hoy. Los ganados se calculan contra los {followersInitial.toLocaleString('es')} con los que entraste.
        </p>
      </label>

      {/* Captura de evidencia */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-3)]">
          Captura de evidencia
        </span>
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-2)] px-4 py-6 cursor-pointer hover:border-[var(--color-primary)] transition-colors text-center">
          <span className="text-3xl" aria-hidden>📸</span>
          <span className="text-sm font-bold text-[var(--color-ink-2)]">
            {file ? file.name : 'Toca para subir tu captura'}
          </span>
          <span className="text-xs text-[var(--color-ink-4)]">
            Screenshot de tu perfil donde se vea el número de seguidores · PNG/JPG/WEBP · máx {MAX_MB} MB
          </span>
          <input
            type="file"
            accept={ACCEPTED.join(',')}
            className="sr-only"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {preview && (
          <div className="flex items-center gap-3 pt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Captura de evidencia"
              className="h-24 w-auto rounded-xl border-2 border-[var(--color-border)] object-cover"
            />
            <p className="text-xs text-[var(--color-ink-4)]">
              {file ? 'Lista para guardar.' : 'Captura ya registrada. Sube otra solo si quieres reemplazarla.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <PopButton type="submit" variant="primary" size="lg" disabled={status === 'saving'} className="w-full sm:w-auto">
          {status === 'saving' ? 'Guardando…' : evidenceUrl ? 'Actualizar seguidores' : 'Registrar seguidores'}
        </PopButton>
        {status === 'done' && (
          <span className="text-sm font-bold text-[var(--color-success)]">✓ Guardado</span>
        )}
      </div>

      {updatedAt && status !== 'done' && (
        <p className="text-xs text-[var(--color-ink-4)]">
          Última actualización: {formatWhen(updatedAt)}
        </p>
      )}
      {status === 'error' && errorMsg && (
        <div className="rounded-2xl bg-[var(--color-danger)]/10 border-2 border-[var(--color-danger)]/40 p-4 text-sm text-[var(--color-danger)]">
          ❌ {errorMsg}
        </div>
      )}
    </form>
  )
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 px-3 py-3 text-center ${accent ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/10' : 'border-[var(--color-border)] bg-[var(--color-bg-2)]'}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-4)]">{label}</p>
      <p className={`font-display font-black text-lg ${accent ? 'text-[var(--color-success)]' : 'text-[var(--color-ink)]'}`}>{value}</p>
    </div>
  )
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
}
