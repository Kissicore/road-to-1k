import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const nextParam = searchParams.get('next') ?? '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash })
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  const nextUrl = (() => {
    try { return new URL(nextParam, origin) } catch { return new URL('/dashboard', origin) }
  })()
  const isSignup = nextUrl.searchParams.get('signup') === '1'

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

  return NextResponse.redirect(nextUrl)
}
