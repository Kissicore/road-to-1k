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
      <nav className="sticky top-0 z-50 border-b border-gold/20 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-13 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-sans font-black text-base tracking-tight text-gold hover:text-gold/80 transition-colors"
            >
              Admin · Road to 1K
            </Link>
            <Link href="/admin/participants" className="btn-ghost text-sm">
              Participantes
            </Link>
            <Link href="/admin/submissions" className="btn-ghost text-sm">
              Submissions
            </Link>
          </div>
          <Link href="/dashboard" className="btn-ghost text-sm text-muted">
            Salir admin
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
