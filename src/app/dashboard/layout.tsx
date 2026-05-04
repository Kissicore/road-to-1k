import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('participants')
    .select('full_name, instagram_handle, state, role')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="flex-1 flex flex-col">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Road to 1K
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard/subir" className="text-neutral-300 hover:text-white">
            Subir Reel
          </Link>
          <Link href="/dashboard/checkpoint" className="text-neutral-300 hover:text-white">
            Checkpoints
          </Link>
          <Link href="/dashboard/venta" className="text-neutral-300 hover:text-white">
            Ventas
          </Link>
          <Link href="/ranking" className="text-neutral-300 hover:text-white">
            Ranking
          </Link>
          {me?.role === 'admin' && (
            <Link href="/admin" className="text-amber-400 hover:text-amber-300">
              Admin
            </Link>
          )}
          <span className="text-neutral-500">@{me?.instagram_handle}</span>
        </div>
      </nav>
      {me?.state === 'pending' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-sm px-6 py-2 text-center">
          Tu inscripción está pendiente de aprobación. Te activamos antes del 10 de mayo.
        </div>
      )}
      {children}
    </div>
  )
}
