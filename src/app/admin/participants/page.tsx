import { createClient } from '@/lib/supabase/server'
import { ParticipantsTable } from './participants-table'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function AdminParticipants() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('participants')
    .select('id, full_name, email, instagram_handle, rubro, followers_initial, followers_final, followers_evidence_path, followers_updated_at, role, state, created_at, notes')
    .order('created_at', { ascending: false })

  // El bucket "hooks" es privado: firmamos un URL temporal por cada captura.
  const withEvidence = await Promise.all(
    (rows ?? []).map(async (r) => {
      let evidence_url: string | null = null
      if (r.followers_evidence_path) {
        const { data: signed } = await supabase
          .storage
          .from('hooks')
          .createSignedUrl(r.followers_evidence_path, 60 * 60)
        evidence_url = signed?.signedUrl ?? null
      }
      return { ...r, evidence_url }
    })
  )

  return (
    <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Participantes"
        subtitle="Aprueba o rechaza inscripciones y edita seguidores finales para el cierre."
      />
      <ParticipantsTable initial={withEvidence} />
    </main>
  )
}
