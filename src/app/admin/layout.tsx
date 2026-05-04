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
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-bg)]/90 border-b-2 border-[var(--color-warning)]/40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-display font-black">
              <span className="text-xl">⚡</span>
              <span className="text-[var(--color-warning)]">Admin · Road to 1K</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm">
              <AdminLink href="/admin" label="Resumen" />
              <AdminLink href="/admin/participants" label="Participantes" />
              <AdminLink href="/admin/submissions" label="Submissions" />
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-[var(--color-ink-3)] hover:text-white">
            ← Salir
          </Link>
        </div>
      </nav>
      {children}
    </div>
  )
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-full font-display font-bold text-sm text-[var(--color-ink-2)] hover:bg-white/10 hover:text-white transition"
    >
      {label}
    </Link>
  )
}
