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
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="font-display font-black text-base tracking-tight text-[var(--color-warning)] hover:text-[var(--color-warning)]/80 transition-colors flex items-center gap-1.5"
            >
              <span aria-hidden>⚡</span>
              Admin · Road to 1K
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <AdminLink href="/admin/participants" label="Participantes" />
            <AdminLink href="/admin/submissions" label="Submissions" />
          </div>
          <Link
            href="/"
            className="text-xs text-[var(--color-ink-4)] hover:text-[var(--color-ink-3)] transition-colors flex items-center gap-1"
          >
            &larr; Salir
          </Link>
        </div>
      </nav>
      <div className="flex-1">
        {children}
      </div>
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
