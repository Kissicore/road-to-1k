/**
 * Cliente Gemini para análisis de submissions.
 *
 * Andrea conecta su API key vía GEMINI_API_KEY en .env.local.
 * Modelo: gemini-3.1-flash-lite-preview (multimodal, rápido, bajo costo — ideal para 100 × 42 días).
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

const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview'
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

/** JSON Schema para structured outputs — garantiza que Gemini devuelva el shape correcto. */
const ANALYSIS_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    score_total:          { type: 'number' },
    banda:                { type: 'string', enum: ['LISTO', 'VIABLE', 'ITERAR', 'RECONSTRUIR'] },
    test_1s_pasa:         { type: 'boolean' },
    proposito_intentado:  { type: 'string', enum: ['TOFU', 'MOFU', 'BOFU'] },
    proposito_detectado:  { type: 'string', enum: ['TOFU', 'MOFU', 'BOFU'] },
    mismatch_proposito:   { type: 'boolean' },
    pilar_valor:          { type: 'string' },
    estructura_detectada: { type: 'string' },
    estructura_recomendada: { type: 'string' },
    forma_visual:         { type: 'string', enum: ['F1', 'F2', 'F3', 'F4', 'F5', 'Híbrida'] },
    enc: {
      type: 'object',
      properties: {
        estimulo:         { type: 'number' },
        carga_cognitiva:  { type: 'number' },
        contextualizacion:{ type: 'number' },
      },
      required: ['estimulo', 'carga_cognitiva', 'contextualizacion'],
    },
    triada_gancho: {
      type: 'object',
      properties: {
        verbal:  { type: 'object', properties: { presente: { type: 'boolean' }, tipo: { type: 'string' }, cita: { type: 'string' } }, required: ['presente'] },
        visual:  { type: 'object', properties: { presente: { type: 'boolean' }, tipo: { type: 'string' }, cita: { type: 'string' } }, required: ['presente'] },
        textual: { type: 'object', properties: { presente: { type: 'boolean' }, tipo: { type: 'string' }, cita: { type: 'string' } }, required: ['presente'] },
      },
      required: ['verbal', 'visual', 'textual'],
    },
    gatillos_activados: { type: 'array', items: { type: 'string' } },
    escala_viral: {
      type: 'object',
      properties: {
        n1_idea:      { type: 'number' },
        n2_gancho:    { type: 'number' },
        n3_estructura:{ type: 'number' },
        n4_edicion:   { type: 'number' },
      },
      required: ['n1_idea', 'n2_gancho', 'n3_estructura'],
    },
    puntos_fuertes:    { type: 'array', items: { type: 'string' } },
    problemas_criticos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          problema:         { type: 'string' },
          por_que_importa:  { type: 'string' },
          como_arreglarlo:  { type: 'string' },
        },
        required: ['problema', 'por_que_importa', 'como_arreglarlo'],
      },
    },
    version_textual_mejorada: { type: 'array', items: { type: 'string' } },
    consejo_para_participante: { type: 'string' },
  },
  required: [
    'score_total', 'banda', 'test_1s_pasa', 'mismatch_proposito',
    'estructura_detectada', 'enc', 'triada_gancho', 'gatillos_activados',
    'escala_viral', 'puntos_fuertes', 'problemas_criticos',
    'version_textual_mejorada', 'consejo_para_participante',
  ],
}

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
      response_json_schema: ANALYSIS_RESULT_SCHEMA,
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
  const raw: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('Gemini devolvió respuesta vacía')

  // Con response_json_schema el modelo devuelve JSON válido directamente
  try {
    return JSON.parse(raw) as AnalysisResult
  } catch {
    throw new Error(`Gemini devolvió JSON malformado: ${raw.slice(0, 300)}`)
  }
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
