import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VentaForm } from './venta-form'
import { PageHeader, StatusPill } from '@/components/ui'

export default async function VentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ventas } = await supabase
    .from('sales_evidence')
    .select('*')
    .eq('participant_id', user.id)
    .order('created_at', { ascending: false })

  const total = (ventas ?? []).reduce((acc, v) => acc + Number(v.amount_usd), 0)
  const validated = (ventas ?? []).filter((v) => v.validated).length

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full space-y-8 pb-24 sm:pb-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Bonus por venta"
        subtitle="Registra ventas o ingresos atribuibles al contenido del reto. Cada evidencia validada por Andrea suma puntos al bonus (hasta 100)."
      />

      <VentaForm />

      <section className="space-y-3">
        <h2 className="font-sans font-bold text-base text-foreground">Tus evidencias</h2>
        <div className="card divide-y divide-border">
          {(ventas ?? []).length === 0 && (
            <p className="px-1 py-6 text-sm text-muted text-center">
              Sin ventas registradas todavía.
            </p>
          )}
          {(ventas ?? []).map((v) => (
            <div key={v.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <span className="font-sans font-bold text-foreground">${Number(v.amount_usd).toFixed(2)} USD</span>
                {v.description && (
                  <p className="text-xs text-muted mt-0.5">{v.description}</p>
                )}
              </div>
              <StatusPill status={v.validated ? 'approved' : 'pending'} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
