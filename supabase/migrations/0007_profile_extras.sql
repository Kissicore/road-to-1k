-- Campos auto-editables para que cada participante mantenga su perfil al día
-- y deje su "carta a su yo del pasado" al cierre del reto.

alter table public.participants
  add column if not exists profile_url    text,
  add column if not exists final_message  text;
