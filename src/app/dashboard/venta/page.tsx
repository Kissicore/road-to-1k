import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VentaForm } from './venta-form'

export default async function VentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ventas } = await supabase
    .from('sales_evidence')
    .select('*')
    .eq('participant_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Bonus por venta</h1>
        <p className="text-neutral-400 text-sm">
          Registra ventas o ingresos atribuibles al contenido del reto. Cada
          evidencia validada por Andrea suma puntos al bonus (hasta 100).
        </p>
      </header>

      <VentaForm />

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400">
          Tus evidencias
        </h2>
        <div className="rounded-lg border border-white/10 divide-y divide-white/10">
          {(ventas ?? []).length === 0 && (
            <p className="px-4 py-6 text-sm text-neutral-500">
              Sin ventas registradas todavía.
            </p>
          )}
          {(ventas ?? []).map((v) => (
            <div key={v.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span>${Number(v.amount_usd).toFixed(2)} USD</span>
              <span className="text-neutral-400">
                {v.validated ? 'Validada' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
