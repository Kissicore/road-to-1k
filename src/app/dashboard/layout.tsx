import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const navLinks = [
  { href: '/dashboard/subir',      label: 'Subir Reel' },
  { href: '/dashboard/checkpoint', label: 'Checkpoints' },
  { href: '/dashboard/venta',      label: 'Ventas' },
  { href: '/ranking',              label: 'Ranking' },
]

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
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="font-sans font-black text-lg tracking-tight text-primary hover:text-primary-soft transition-colors"
          >
            Road to 1K
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="btn-ghost text-sm px-3 py-2"
              >
                {l.label}
              </Link>
            ))}
            {me?.role === 'admin' && (
              <Link href="/admin" className="btn-ghost text-sm px-3 py-2 text-gold hover:text-gold/80">
                Admin
              </Link>
            )}
          </div>

          <span className="hidden sm:block text-xs text-muted font-mono">
            @{me?.instagram_handle}
          </span>
        </div>
      </nav>

      {/* ── Pending banner ── */}
      {me?.state === 'pending' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs font-medium px-6 py-2 text-center">
          Tu inscripción esta pendiente de aprobación. Andrea te activa antes del 10 de mayo.
        </div>
      )}

      <div className="flex-1">
        {children}
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { href: '/dashboard',              label: 'Inicio',    icon: '🏠' },
            { href: '/dashboard/subir',        label: 'Subir',     icon: '🎬' },
            { href: '/dashboard/checkpoint',   label: 'CP',        icon: '📊' },
            { href: '/dashboard/venta',        label: 'Ventas',    icon: '💰' },
            { href: '/ranking',                label: 'Ranking',   icon: '🏆' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-muted hover:text-foreground transition-colors"
            >
              <span className="text-lg" aria-hidden>{l.icon}</span>
              <span className="text-[10px]">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
