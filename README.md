# Road to 1K · FÓRMULA 100K

App del reto de 42 días para alumnas de FÓRMULA 100K. Reemplaza el flujo
anterior de Excel + Google Forms con:

- Inscripción y dashboard para participantes
- Subida diaria de Reel + captura del primer segundo
- Análisis automático con Gemini usando los frameworks de FÓRMULA 100K
  (corrector de guiones + evaluador de ganchos)
- Ranking en tiempo real (Supabase Realtime)
- Zona admin para Andrea (aprobación de inscripciones, validación de evidencias,
  edición de seguidores finales)

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind v4
- Supabase (Postgres + Auth + Storage + Realtime)
- Gemini 2.5 Flash (multimodal)
- Vercel para deploy

## Setup

1. Copia `.env.local.example` a `.env.local` y completa con tus claves.
2. Crea el proyecto en Supabase y aplica las migraciones:
   ```sh
   # en el dashboard de Supabase → SQL editor, en orden:
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_rls.sql
   supabase/migrations/0003_storage.sql
   ```
3. Habilita Email auth con magic link en Supabase → Authentication → Providers.
4. En Authentication → URL Configuration: Site URL = tu dominio Vercel; añade
   `http://localhost:3000` a Redirect URLs.
5. Crea tu fila admin manualmente: en `participants`, inserta tu UID con
   `role='admin'` y `state='approved'`.
6. `npm run dev` y abre `http://localhost:3000`.

## Despliegue

Push al repo → conecta en vercel.com → set env vars → deploy.

## Análisis IA

Andrea conecta su `GEMINI_API_KEY` y la app llama a `gemini-2.5-flash` con el
prompt unificado de `src/lib/ai/prompts.ts`. El procesamiento ocurre en
background por una Edge Function de Supabase (pendiente de implementar como
siguiente iteración).
