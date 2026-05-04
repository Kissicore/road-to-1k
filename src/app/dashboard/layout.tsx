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
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-black text-lg">
            <span className="text-2xl">🎯</span>
            Road to 1K
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <NavLink href="/dashboard" label="Inicio" />
            <NavLink href="/dashboard/subir" label="Subir Reel" emoji="🎬" />
            <NavLink href="/dashboard/checkpoint" label="Checkpoints" emoji="📊" />
            <NavLink href="/dashboard/venta" label="Ventas" emoji="💰" />
            <NavLink href="/ranking" label="Ranking" emoji="🏆" />
            {me?.role === 'admin' && (
              <NavLink href="/admin" label="Admin" emoji="⚡" highlight />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[var(--color-ink-3)] font-medium">
              @{me?.instagram_handle}
            </span>
          </div>
        </div>
      </nav>

      {me?.state === 'pending' && (
        <div className="bg-gradient-to-r from-[var(--color-warning)]/15 to-[var(--color-primary)]/15 border-b-2 border-[var(--color-warning)]/40">
          <div className="max-w-6xl mx-auto px-6 py-3 text-center text-sm text-[var(--color-warning)] font-bold">
            ⏳ Tu inscripción está pendiente de aprobación. Te activamos antes del 10 de mayo.
          </div>
        </div>
      )}

      {children}

      <footer className="md:hidden sticky bottom-0 bg-[var(--color-bg)]/95 backdrop-blur-md border-t border-[var(--color-border)] z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          <MobileNav href="/dashboard" emoji="🎯" label="Hoy" />
          <MobileNav href="/dashboard/subir" emoji="🎬" label="Reel" />
          <MobileNav href="/dashboard/checkpoint" emoji="📊" label="CP" />
          <MobileNav href="/dashboard/venta" emoji="💰" label="Venta" />
          <MobileNav href="/ranking" emoji="🏆" label="Top" />
        </div>
      </footer>
    </div>
  )
}

function NavLink({
  href, label, emoji, highlight,
}: { href: string; label: string; emoji?: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-full font-display font-bold text-sm transition hover:bg-white/10 ${
        highlight
          ? 'text-[var(--color-warning)] hover:bg-[var(--color-warning)]/15'
          : 'text-[var(--color-ink-2)] hover:text-white'
      }`}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      {label}
    </Link>
  )
}

function MobileNav({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 py-2 rounded-xl hover:bg-white/5"
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-3)]">{label}</span>
    </Link>
  )
}
