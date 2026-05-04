import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatTile } from '@/components/ui'

export default async function AdminHome() {
  const supabase = await createClient()
  const [{ count: total }, { count: pending }, { count: subsToday }] = await Promise.all([
    supabase.from('participants').select('*', { count: 'exact', head: true }),
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('state', 'pending'),
    supabase
      .from('daily_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full space-y-8">
      <PageHeader
        eyebrow="Panel de control"
        title="Resumen del reto"
      />
      <section className="grid sm:grid-cols-3 gap-4">
        <StatTile label="Inscritas totales"          value={total ?? 0} accent="cyan" />
        <StatTile label="Pendientes de aprobación"   value={pending ?? 0} accent="gold" />
        <StatTile label="Submissions hoy"            value={subsToday ?? 0} accent="pink" />
      </section>
    </main>
  )
}
