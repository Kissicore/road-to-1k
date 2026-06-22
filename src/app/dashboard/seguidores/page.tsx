import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { SeguidoresForm } from './seguidores-form'

export const dynamic = 'force-dynamic'

export default async function SeguidoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: me } = await supabase
    .from('participants')
    .select('followers_initial, followers_final, followers_evidence_path, followers_updated_at')
    .eq('id', user.id)
    .maybeSingle()

  // El bucket "hooks" es privado: firmamos un URL temporal para mostrar la captura.
  let evidenceUrl: string | null = null
  if (me?.followers_evidence_path) {
    const { data: signed } = await supabase
      .storage
      .from('hooks')
      .createSignedUrl(me.followers_evidence_path, 60 * 60)
    evidenceUrl = signed?.signedUrl ?? null
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full space-y-6 pb-24 sm:pb-10">
      <PageHeader
        eyebrow="Tu progreso"
        title="Seguidores ganados"
        subtitle="Registra cuántos seguidores tienes hoy y sube la captura que lo prueba. Es la métrica que más suma en el ranking."
      />
      <SeguidoresForm
        followersInitial={me?.followers_initial ?? 0}
        followersFinal={me?.followers_final ?? null}
        evidenceUrl={evidenceUrl}
        updatedAt={me?.followers_updated_at ?? null}
      />
    </main>
  )
}
