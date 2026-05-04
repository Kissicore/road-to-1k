import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('participants')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (me?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex-1 flex flex-col">
      <nav className="border-b border-amber-500/20 bg-amber-500/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold tracking-tight text-amber-200">
            Admin · Road to 1K
          </Link>
          <Link href="/admin/participants" className="text-sm text-neutral-300 hover:text-white">
            Participantes
          </Link>
          <Link href="/admin/submissions" className="text-sm text-neutral-300 hover:text-white">
            Submissions
          </Link>
        </div>
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white">
          Salir admin
        </Link>
      </nav>
      {children}
    </div>
  )
}
