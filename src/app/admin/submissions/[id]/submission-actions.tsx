'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PopButton } from '@/components/ui'

type SubStatus = 'valid' | 'invalid' | 'duplicate' | 'pending_review'

export function SubmissionActions({
  id,
  status,
}: { id: string; status: SubStatus }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function setStatus(next: SubStatus) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('daily_submissions').update({ status: next }).eq('id', id)
    setSaving(false)
    router.refresh()
  }

  async function requeueAnalysis() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('daily_submissions')
      .update({ analysis_status: 'queued', analysis_input_hash: null })
      .eq('id', id)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <PopButton
        variant="success"
        size="sm"
        disabled={saving || status === 'valid'}
        onClick={() => setStatus('valid')}
      >
        ✓ Marcar válida
      </PopButton>
      <PopButton
        variant="ghost"
        size="sm"
        disabled={saving || status === 'invalid'}
        onClick={() => setStatus('invalid')}
      >
        ✗ Marcar inválida
      </PopButton>
      <PopButton
        variant="ghost"
        size="sm"
        disabled={saving || status === 'duplicate'}
        onClick={() => setStatus('duplicate')}
      >
        ♻️ Duplicada
      </PopButton>
      <PopButton
        variant="accent"
        size="sm"
        disabled={saving}
        onClick={requeueAnalysis}
      >
        🔁 Re-analizar
      </PopButton>
    </div>
  )
}
