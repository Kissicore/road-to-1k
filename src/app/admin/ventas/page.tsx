import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatTile } from '@/components/ui'
import { VentasTable } from './ventas-table'

export const dynamic = 'force-dynamic'

export default async function AdminVentas() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('sales_evidence')
    .select(`
      id, amount_usd, evidence_url, description, validated, created_at,
      participant:participants!inner(id, full_name, instagram_handle)
    `)
    .order('created_at', { ascending: false })

  const total = rows?.length ?? 0
  const validated = rows?.filter((r) => r.validated) ?? []
  const totalValidatedUsd = validated.reduce((acc, r) => acc + Number(r.amount_usd), 0)
  const pending = total - validated.length

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="Admin · Ventas"
        title="Bonus por venta"
        subtitle="Valida cada evidencia que las participantes suben. Solo las validadas suman al bonus de hasta 100 puntos."
      />

      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Total subidas" value={total} accent="cyan" />
        <StatTile label="Validadas" value={validated.length} accent="lime" hint={`$${totalValidatedUsd.toFixed(0)} USD`} />
        <StatTile label="Pendientes" value={pending} accent="gold" />
      </section>

      <VentasTable initial={(rows ?? []) as never[]} />
    </main>
  )
}
