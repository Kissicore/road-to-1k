import { createClient } from '@/lib/supabase/server'
import { ParticipantsTable } from './participants-table'

export const dynamic = 'force-dynamic'

export default async function AdminParticipants() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('participants')
    .select('id, full_name, email, instagram_handle, rubro, followers_initial, followers_final, role, state, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Participantes</h1>
        <p className="text-neutral-400 text-sm">
          Aprueba / rechaza inscripciones y edita seguidores finales para el cierre.
        </p>
      </header>
      <ParticipantsTable initial={rows ?? []} />
    </main>
  )
}
