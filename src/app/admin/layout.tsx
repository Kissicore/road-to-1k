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
      <nav className="sticky top-0 z-50 border-b-2 border-[var(--color-warning)]/30 bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="font-display font-black text-base tracking-tight text-[var(--color-warning)] flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Admin · Road to 1K</span>
            <span className="sm:hidden">Admin</span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            <AdminLink href="/admin/participants" emoji="👥" label="Participantes" />
            <AdminLink href="/admin/submissions" emoji="🎬" label="Reels" />
            <AdminLink href="/admin/checkpoints" emoji="📊" label="Checkpoints" />
            <AdminLink href="/admin/ventas" emoji="💰" label="Ventas" />
            <AdminLink href="/admin/ranking" emoji="🏆" label="Ranking" />
          </div>
          <Link href="/dashboard" className="text-xs text-[var(--color-ink-3)] hover:text-white whitespace-nowrap">
            ← Salir
          </Link>
        </div>
      </nav>
      {children}
    </div>
  )
}

function AdminLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-2.5 py-1.5 rounded-full font-display font-bold text-xs sm:text-sm text-[var(--color-ink-2)] hover:bg-white/10 hover:text-white transition whitespace-nowrap"
    >
      <span className="mr-1">{emoji}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
