import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const isSignup = searchParams.get('signup') === '1'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Si viene del signup, materializa la fila de participants con los datos del metadata.
  if (isSignup) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const meta = user.user_metadata ?? {}
      await supabase.from('participants').upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: meta.full_name ?? user.email!.split('@')[0],
          instagram_handle: (meta.instagram_handle ?? '').toString().toLowerCase(),
          rubro: meta.rubro ?? null,
          followers_initial: Number(meta.followers_initial ?? 0),
          state: 'pending',
          role: 'participant',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
