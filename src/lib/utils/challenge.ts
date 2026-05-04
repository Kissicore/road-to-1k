import { createClient as createServerClient } from '@/lib/supabase/server'

export type Challenge = {
  id: number
  edition_label: string
  start_date: string
  end_date: string
  total_days: number
  checkpoint_1: string
  checkpoint_2: string
  checkpoint_3: string
  signup_deadline: string
}

export async function getChallenge(): Promise<Challenge> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('challenge')
    .select('*')
    .eq('id', 1)
    .single()
  if (error || !data) throw new Error('Challenge config missing')
  return data as Challenge
}

export function dayNumberFor(date: Date, startISO: string, totalDays: number): number | null {
  const start = new Date(startISO + 'T00:00:00Z')
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1
  if (day < 1 || day > totalDays) return null
  return day
}
