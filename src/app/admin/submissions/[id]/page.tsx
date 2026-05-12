import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, GradientCard, StatusPill } from '@/components/ui'
import { SubmissionActions } from './submission-actions'

export const dynamic = 'force-dynamic'

type Params = { id: string }

export default async function AdminSubmissionDetail({
  params,
}: { params: Promise<Params> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: row } = await supabase
    .from('daily_submissions')
    .select(`
      id, day_number, reel_url, hook_screenshot_path, observations,
      status, analysis_status, analysis_result, analysis_input_hash,
      correction_count, created_at, updated_at,
      participant:participants!inner(id, full_name, instagram_handle, email)
    `)
    .eq('id', id)
    .maybeSingle()

  if (!row) notFound()

  const p = row.participant as unknown as {
    id: string
    full_name: string
    instagram_handle: string
    email: string
  }

  // Signed URL para la captura (privada en Storage)
  let hookUrl: string | null = null
  if (row.hook_screenshot_path) {
    const { data } = await supabase.storage
      .from('hooks')
      .createSignedUrl(row.hook_screenshot_path, 60 * 10)
    hookUrl = data?.signedUrl ?? null
  }

  const analysis = (row.analysis_result ?? null) as AnalysisResult | null

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full space-y-6">
      <Link
        href="/admin/submissions"
        className="inline-block text-sm text-[var(--color-ink-3)] hover:text-white"
      >
        ← Submissions
      </Link>

      <PageHeader
        eyebrow={`Día ${row.day_number} · ${new Date(row.created_at).toLocaleString('es')}`}
        title={`${p.full_name} · @${p.instagram_handle}`}
        subtitle={p.email}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={row.status} />
        <StatusPill status={row.analysis_status} />
        {typeof row.correction_count === 'number' && row.correction_count > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/40">
            ✏️ {row.correction_count}/2 correcciones usadas
          </span>
        )}
      </div>

      <SubmissionActions id={row.id} status={row.status} />

      <section className="grid md:grid-cols-2 gap-4">
        <GradientCard className="space-y-3">
          <h2 className="font-display font-black">📸 Captura del primer segundo</h2>
          {hookUrl ? (
            <a href={hookUrl} target="_blank" rel="noreferrer" className="block">
              <img
                src={hookUrl}
                alt="Captura primer segundo"
                className="w-full rounded-xl border-2 border-[var(--color-border)]"
              />
            </a>
          ) : (
            <p className="text-sm text-[var(--color-ink-3)]">Sin captura subida.</p>
          )}
        </GradientCard>

        <GradientCard className="space-y-3">
          <h2 className="font-display font-black">🔗 Link del Reel</h2>
          <a
            href={row.reel_url}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-accent)] hover:underline break-all text-sm"
          >
            {row.reel_url}
          </a>
          {row.observations && (
            <>
              <h3 className="font-display font-bold text-sm mt-3">📝 Observaciones</h3>
              <p className="text-sm text-[var(--color-ink-2)] whitespace-pre-wrap">
                {row.observations}
              </p>
            </>
          )}
        </GradientCard>
      </section>

      <section>
        <h2 className="font-display text-xl font-black mb-3">🤖 Análisis IA</h2>
        {analysis ? (
          <AnalysisView a={analysis} />
        ) : (
          <GradientCard className="text-center py-8">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-sm text-[var(--color-ink-3)]">
              Aún no hay análisis para esta submission. Status: {row.analysis_status}.
            </p>
          </GradientCard>
        )}
      </section>
    </main>
  )
}

type AnalysisResult = {
  score_total?: number
  banda?: string
  test_1s_pasa?: boolean
  proposito_intentado?: string | null
  proposito_detectado?: string | null
  mismatch_proposito?: boolean
  pilar_valor?: string | null
  estructura_detectada?: string
  estructura_recomendada?: string | null
  forma_visual?: string | null
  enc?: { estimulo?: number; carga_cognitiva?: number; contextualizacion?: number }
  triada_gancho?: {
    verbal?: { presente?: boolean; tipo?: string | null; cita?: string | null }
    visual?: { presente?: boolean; tipo?: string | null; cita?: string | null }
    textual?: { presente?: boolean; tipo?: string | null; cita?: string | null }
  }
  gatillos_activados?: string[]
  escala_viral?: { n1_idea?: number; n2_gancho?: number; n3_estructura?: number; n4_edicion?: number | null }
  puntos_fuertes?: string[]
  problemas_criticos?: Array<{ problema?: string; por_que_importa?: string; como_arreglarlo?: string }>
  version_textual_mejorada?: string[]
  consejo_para_participante?: string
}

function AnalysisView({ a }: { a: AnalysisResult }) {
  const bandColor = {
    LISTO: 'text-[var(--color-success)]',
    VIABLE: 'text-[var(--color-accent)]',
    ITERAR: 'text-[var(--color-warning)]',
    RECONSTRUIR: 'text-[var(--color-danger)]',
  }[a.banda ?? ''] ?? 'text-[var(--color-ink-2)]'

  return (
    <div className="space-y-4">
      <div className="card-pop p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-[var(--color-ink-3)]">
            Score total
          </p>
          <p className="font-display text-6xl font-black">
            {a.score_total ?? '—'}
            <span className="text-2xl text-[var(--color-ink-4)]"> /100</span>
          </p>
          <p className={`font-display font-black mt-1 ${bandColor}`}>{a.banda ?? '—'}</p>
        </div>
        <div className="text-sm space-y-1">
          {a.test_1s_pasa != null && (
            <p>Test 1s: <span className={a.test_1s_pasa ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
              {a.test_1s_pasa ? '✓ pasa' : '✗ no pasa'}
            </span></p>
          )}
          {a.forma_visual && <p>Forma visual: <span className="font-bold">{a.forma_visual}</span></p>}
          {a.pilar_valor && <p>Pilar: <span className="font-bold">{a.pilar_valor}</span></p>}
          {a.estructura_detectada && <p>Estructura: <span className="font-bold">{a.estructura_detectada}</span></p>}
        </div>
      </div>

      {a.consejo_para_participante && (
        <div className="card-pop p-5 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent">
          <p className="text-xs uppercase tracking-wider font-bold text-[var(--color-primary-2)] mb-1">
            Consejo
          </p>
          <p className="text-sm">{a.consejo_para_participante}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {a.escala_viral && (
          <GradientCard>
            <h3 className="font-display font-bold mb-3">📊 Escala Viral</h3>
            <ScaleBar label="Idea (Atención)" value={a.escala_viral.n1_idea} />
            <ScaleBar label="Gancho" value={a.escala_viral.n2_gancho} />
            <ScaleBar label="Estructura" value={a.escala_viral.n3_estructura} />
            {a.escala_viral.n4_edicion != null && (
              <ScaleBar label="Edición" value={a.escala_viral.n4_edicion} />
            )}
          </GradientCard>
        )}

        {a.enc && (
          <GradientCard>
            <h3 className="font-display font-bold mb-3">🎯 Sistema E.N.C.</h3>
            <ScaleBar label="Estímulo Núcleo" value={a.enc.estimulo} max={10} />
            <ScaleBar label="Carga Cognitiva" value={a.enc.carga_cognitiva} max={10} />
            <ScaleBar label="Contextualización" value={a.enc.contextualizacion} max={10} />
          </GradientCard>
        )}
      </div>

      {a.triada_gancho && (
        <GradientCard>
          <h3 className="font-display font-bold mb-3">🎣 Tríada del Gancho</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <HookCell title="Verbal" data={a.triada_gancho.verbal} />
            <HookCell title="Visual" data={a.triada_gancho.visual} />
            <HookCell title="Textual" data={a.triada_gancho.textual} />
          </div>
        </GradientCard>
      )}

      {a.gatillos_activados && a.gatillos_activados.length > 0 && (
        <GradientCard>
          <h3 className="font-display font-bold mb-2">⚡ Gatillos activados</h3>
          <div className="flex flex-wrap gap-2">
            {a.gatillos_activados.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/40"
              >
                {g}
              </span>
            ))}
          </div>
        </GradientCard>
      )}

      {a.problemas_criticos && a.problemas_criticos.length > 0 && (
        <GradientCard>
          <h3 className="font-display font-bold mb-3">🩺 Problemas críticos</h3>
          <ul className="space-y-3">
            {a.problemas_criticos.map((p, i) => (
              <li key={i} className="border-l-2 border-[var(--color-danger)]/60 pl-3">
                <p className="font-bold text-sm">{p.problema}</p>
                {p.por_que_importa && (
                  <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                    <span className="font-bold">Por qué importa:</span> {p.por_que_importa}
                  </p>
                )}
                {p.como_arreglarlo && (
                  <p className="text-xs text-[var(--color-success)] mt-0.5">
                    <span className="font-bold">Cómo arreglarlo:</span> {p.como_arreglarlo}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </GradientCard>
      )}

      {a.puntos_fuertes && a.puntos_fuertes.length > 0 && (
        <GradientCard>
          <h3 className="font-display font-bold mb-2">✅ Lo que funciona</h3>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {a.puntos_fuertes.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </GradientCard>
      )}

      {a.version_textual_mejorada && a.version_textual_mejorada.length > 0 && (
        <GradientCard>
          <h3 className="font-display font-bold mb-2">✏️ Sugerencias de gancho textual</h3>
          <ul className="text-sm space-y-2">
            {a.version_textual_mejorada.map((v, i) => (
              <li key={i} className="border border-[var(--color-border)] rounded-lg p-2 bg-[var(--color-bg-2)]">
                {v}
              </li>
            ))}
          </ul>
        </GradientCard>
      )}
    </div>
  )
}

function ScaleBar({ label, value, max = 100 }: { label: string; value?: number | null; max?: number }) {
  const v = value ?? 0
  const pct = Math.max(0, Math.min(100, (v / max) * 100))
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="font-bold">{v}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-bg-2)] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function HookCell({
  title,
  data,
}: {
  title: string
  data?: { presente?: boolean; tipo?: string | null; cita?: string | null }
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-display font-bold text-sm">{title}</span>
        <span className="text-xs">
          {data?.presente ? '✅' : '❌'}
        </span>
      </div>
      {data?.tipo && <p className="text-xs text-[var(--color-ink-2)]">{data.tipo}</p>}
      {data?.cita && (
        <p className="text-xs text-[var(--color-ink-3)] italic mt-1">"{data.cita}"</p>
      )}
    </div>
  )
}
