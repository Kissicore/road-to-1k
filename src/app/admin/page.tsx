import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatTile } from '@/components/ui'

export default async function AdminHome() {
  const supabase = await createClient()
  const [{ count: total }, { count: pending }, { count: subsToday }, { count: validated }] = await Promise.all([
    supabase.from('participants').select('*', { count: 'exact', head: true }),
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('state', 'pending'),
    supabase
      .from('daily_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('state', 'approved'),
  ])

  return (
    <main className="px-6 py-10 max-w-5xl mx-auto w-full space-y-8">
      <PageHeader
        eyebrow="Panel de control"
        title="Resumen del reto"
        subtitle="Road to 1K — FÓRMULA 100K · Edición 11 mayo 2026"
      />
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Inscritas totales"         value={total ?? 0}      accent="accent" />
        <StatTile label="Pendientes de aprobación"  value={pending ?? 0}    accent="secondary" hint="Requieren revisión" />
        <StatTile label="Submissions hoy"           value={subsToday ?? 0}  accent="primary" />
        <StatTile label="Aprobadas"                 value={validated ?? 0}  accent="success" />
      </section>
      <section className="grid sm:grid-cols-2 gap-4">
        <a
          href="/admin/participants"
          className="card-pop p-6 flex items-center justify-between group hover:border-[var(--color-accent)] transition-colors"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] mb-1">Gestionar</p>
            <p className="font-display font-black text-lg text-[var(--color-ink)]">Participantes</p>
            <p className="text-xs text-[var(--color-ink-4)] mt-0.5">Aprobar, rechazar y editar datos</p>
          </div>
          <span className="text-2xl text-[var(--color-ink-4)] group-hover:text-[var(--color-accent)] transition-colors" aria-hidden>→</span>
        </a>
        <a
          href="/admin/submissions"
          className="card-pop p-6 flex items-center justify-between group hover:border-[var(--color-primary)] transition-colors"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)] mb-1">Revisar</p>
            <p className="font-display font-black text-lg text-[var(--color-ink)]">Submissions</p>
            <p className="text-xs text-[var(--color-ink-4)] mt-0.5">Ver reels y estados de análisis</p>
          </div>
          <span className="text-2xl text-[var(--color-ink-4)] group-hover:text-[var(--color-primary)] transition-colors" aria-hidden>→</span>
        </a>
      </section>
    </main>
  )
}
