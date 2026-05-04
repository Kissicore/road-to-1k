import { createClient } from '@/lib/supabase/server'
import { ParticipantsTable } from './participants-table'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function AdminParticipants() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('participants')
    .select('id, full_name, email, instagram_handle, rubro, followers_initial, followers_final, role, state, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="⚡ Admin · Participantes"
        title="Gestiona inscripciones"
        subtitle="Aprueba / rechaza inscripciones y edita seguidores finales para el cierre del reto."
      />
      <ParticipantsTable initial={rows ?? []} />
    </main>
  )
}
