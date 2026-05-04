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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] flex flex-col">
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-50 bg-[var(--color-bg-2)]/90 backdrop-blur-md border-b-2 border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-display font-black text-lg text-[var(--color-primary)]">
            🎯 Road to 1K
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <NavLink href="/dashboard/subir" emoji="🎬" label="Subir Reel" />
            <NavLink href="/dashboard/checkpoint" emoji="📊" label="Checkpoints" />
            <NavLink href="/dashboard/venta" emoji="💰" label="Ventas" />
            <NavLink href="/ranking" emoji="🏆" label="Ranking" />
            {me?.role === 'admin' && (
              <NavLink href="/admin" emoji="⚡" label="Admin" highlight />
            )}
          </div>

          <span className="hidden sm:block text-xs font-mono text-[var(--color-ink-4)]">
            @{me?.instagram_handle}
          </span>
        </div>
      </nav>

      {/* ── Pending banner ── */}
      {me?.state === 'pending' && (
        <div className="bg-[var(--color-warning)]/10 border-b-2 border-[var(--color-warning)]/30 text-[var(--color-warning)] text-xs font-bold px-6 py-2 text-center">
          ⏳ Tu inscripción está pendiente de aprobación. Te activamos antes del 10 de mayo.
        </div>
      )}

      {children}

      {/* ── Mobile bottom nav ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
        <div className="flex items-center justify-around px-2 py-2">
          <MobileNav href="/dashboard" emoji="🏠" label="Inicio" />
          <MobileNav href="/dashboard/subir" emoji="🎬" label="Subir" />
          <MobileNav href="/dashboard/checkpoint" emoji="📊" label="CP" />
          <MobileNav href="/dashboard/venta" emoji="💰" label="Ventas" />
          <MobileNav href="/ranking" emoji="🏆" label="Ranking" />
        </div>
      </nav>
    </div>
  )
}

function NavLink({
  href, label, emoji, highlight,
}: { href: string; label: string; emoji?: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors hover:bg-[var(--color-surface-2)] ${highlight ? 'text-[var(--color-warning)]' : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'}`}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {label}
    </Link>
  )
}

function MobileNav({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[var(--color-ink-4)] hover:text-[var(--color-ink)] transition-colors"
    >
      <span className="text-lg" aria-hidden>{emoji}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  )
}
