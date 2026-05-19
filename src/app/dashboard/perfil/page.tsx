import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getChallenge, dayNumberFor } from '@/lib/utils/challenge'
import { PageHeader } from '@/components/ui'
import { PerfilForm } from './perfil-form'
import { CartaForm } from './carta-form'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const challenge = await getChallenge()
  const todayDay = dayNumberFor(new Date(), challenge.start_date, challenge.total_days)

  const { data: me } = await supabase
    .from('participants')
    .select('email, full_name, instagram_handle, profile_url, final_message')
    .eq('id', user.id)
    .maybeSingle()

  if (!me) redirect('/dashboard')

  const todayISO = new Date().toISOString().slice(0, 10)
  const challengeEnded = todayISO > challenge.end_date

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full space-y-8 pb-24 sm:pb-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Mi perfil"
        subtitle="Mantén tu información al día — Andrea y el ranking la usan."
      />

      <PerfilForm
        initial={{
          email: me.email,
          full_name: me.full_name,
          instagram_handle: me.instagram_handle,
          profile_url: me.profile_url ?? '',
        }}
      />

      <CartaForm
        initial={me.final_message ?? ''}
        challengeEnded={challengeEnded}
        todayDay={todayDay}
        totalDays={challenge.total_days}
      />
    </main>
  )
}
