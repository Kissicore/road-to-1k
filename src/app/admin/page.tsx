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
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-8">
      <PageHeader
        eyebrow="⚡ Admin"
        title="Resumen del reto"
        subtitle="Vista de gestora · todo lo que pasa en el reto"
      />
      <section className="grid sm:grid-cols-4 gap-4">
        <StatTile label="Inscritas totales" value={total ?? 0} accent="primary" />
        <StatTile label="Aprobadas" value={validated ?? 0} accent="success" />
        <StatTile label="Pendientes" value={pending ?? 0} accent="accent" hint="por aprobar" />
        <StatTile label="Submissions hoy" value={subsToday ?? 0} accent="secondary" />
      </section>
    </main>
  )
}
