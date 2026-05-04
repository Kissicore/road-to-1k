/**
 * Cliente Gemini para análisis de submissions.
 *
 * Andrea conecta su API key vía GEMINI_API_KEY en .env.local.
 * Modelo recomendado: gemini-2.5-flash (multimodal, rápido y barato para 100 personas × 42 días).
 *
 * Este módulo es server-only. No exponer al cliente.
 */

import { SYSTEM_PROMPT, buildUserPrompt, type AnalysisInput } from './prompts'

export type AnalysisResult = {
  score_total: number
  banda: 'LISTO' | 'VIABLE' | 'ITERAR' | 'RECONSTRUIR'
  test_1s_pasa: boolean
  proposito_intentado: 'TOFU' | 'MOFU' | 'BOFU' | null
  proposito_detectado: 'TOFU' | 'MOFU' | 'BOFU' | null
  mismatch_proposito: boolean
  pilar_valor: string | null
  estructura_detectada: string
  estructura_recomendada: string | null
  forma_visual: string | null
  enc: { estimulo: number; carga_cognitiva: number; contextualizacion: number }
  triada_gancho: {
    verbal:  { presente: boolean; tipo: string | null; cita: string | null }
    visual:  { presente: boolean; tipo: string | null; cita: string | null }
    textual: { presente: boolean; tipo: string | null; cita: string | null }
  }
  gatillos_activados: string[]
  escala_viral: { n1_idea: number; n2_gancho: number; n3_estructura: number; n4_edicion: number | null }
  puntos_fuertes: string[]
  problemas_criticos: Array<{ problema: string; por_que_importa: string; como_arreglarlo: string }>
  version_textual_mejorada: string[]
  consejo_para_participante: string
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

/**
 * Llama a Gemini con el prompt unificado de FÓRMULA 100K.
 * Devuelve el JSON parseado o lanza error si la respuesta no es JSON válido.
 */
export async function analyzeSubmission(
  input: AnalysisInput,
  hookImageBase64?: string  // jpeg/png en base64 (sin "data:image/...;base64,")
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no está configurado')

  const parts: Array<Record<string, unknown>> = [{ text: buildUserPrompt(input) }]
  if (hookImageBase64) {
    parts.push({
      inline_data: { mime_type: 'image/jpeg', data: hookImageBase64 },
    })
  }

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.4,
    },
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Gemini ${res.status}: ${txt.slice(0, 500)}`)
  }

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('Gemini devolvió respuesta vacía')

  return JSON.parse(raw) as AnalysisResult
}

/**
 * Hash determinístico para cachear análisis (no re-llamar si entradas no cambiaron).
 */
export async function hashAnalysisInput(input: AnalysisInput, image?: string): Promise<string> {
  const payload = JSON.stringify({ ...input, image: image ?? null })
  const buffer = new TextEncoder().encode(payload)
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
