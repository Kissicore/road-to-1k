-- Seguidores finales + captura de evidencia auto-reportados por la participante.
-- Antes solo Andrea podía editar followers_final desde admin; ahora cada
-- participante registra sus seguidores actuales y sube la captura que lo prueba.
-- La evidencia vive en el bucket privado "hooks" bajo {uid}/followers/...
-- (cubierto por las policies de 0003_storage.sql, que exigen uid como 1er folder).

alter table public.participants
  add column if not exists followers_evidence_path text,
  add column if not exists followers_updated_at     timestamptz;
