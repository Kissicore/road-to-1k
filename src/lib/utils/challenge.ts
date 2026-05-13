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

export {
  dayNumberFor,
  CHALLENGE_TIMEZONE,
  CHALLENGE_TZ_LABEL,
  CHALLENGE_TZ_SHORT,
} from './challenge-day'
