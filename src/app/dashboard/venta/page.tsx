import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VentaForm } from './venta-form'
import { PageHeader, GradientCard, StatusPill } from '@/components/ui'

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
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full space-y-8">
      <PageHeader
        eyebrow="💰 Bonus por venta"
        title={<>Hasta <span className="shimmer-text">100 puntos</span> extra</>}
        subtitle="Cada venta o ingreso que generes con el contenido del reto suma puntos al ranking final. Sube la evidencia (captura de Stripe, Hotmart, transferencia, Yape, Plin, etc.) ocultando datos sensibles."
      />

      {(ventas ?? []).length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          <GradientCard>
            <p className="text-xs uppercase font-bold text-[var(--color-ink-3)] tracking-wider">Total registrado</p>
            <p className="font-display text-3xl font-black mt-1">${total.toFixed(0)} <span className="text-sm font-normal text-[var(--color-ink-3)]">USD</span></p>
          </GradientCard>
          <GradientCard>
            <p className="text-xs uppercase font-bold text-[var(--color-ink-3)] tracking-wider">Evidencias validadas</p>
            <p className="font-display text-3xl font-black mt-1">{validated} <span className="text-sm font-normal text-[var(--color-ink-3)]">/ {ventas?.length}</span></p>
          </GradientCard>
        </div>
      )}

      <VentaForm />

      <section className="space-y-3">
        <h2 className="font-display text-xl font-black">Tus evidencias</h2>
        {(ventas ?? []).length === 0 ? (
          <GradientCard className="text-center py-10">
            <p className="text-4xl mb-3">💸</p>
            <p className="font-display font-bold">Sin ventas registradas todavía</p>
            <p className="text-sm text-[var(--color-ink-3)] mt-1">
              Cada venta atribuible al reto suma puntos.
            </p>
          </GradientCard>
        ) : (
          <div className="card-pop p-2 divide-y divide-[var(--color-border)]">
            {(ventas ?? []).map((v) => (
              <div key={v.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-black">${Number(v.amount_usd).toFixed(2)}</p>
                  {v.description && (
                    <p className="text-xs text-[var(--color-ink-3)] mt-0.5">{v.description}</p>
                  )}
                </div>
                <StatusPill
                  state={v.validated ? 'success' : 'warn'}
                  label={v.validated ? '✓ Validada' : 'Pendiente'}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
