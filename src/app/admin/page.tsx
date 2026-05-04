import { createClient } from '@/lib/supabase/server'

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
      <header>
        <h1 className="text-2xl font-semibold">Resumen del reto</h1>
      </header>
      <section className="grid sm:grid-cols-3 gap-4">
        <Card label="Inscritas totales" value={total ?? 0} />
        <Card label="Pendientes de aprobación" value={pending ?? 0} />
        <Card label="Submissions hoy" value={subsToday ?? 0} />
      </section>
    </main>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  )
}
