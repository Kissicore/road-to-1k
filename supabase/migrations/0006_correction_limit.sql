-- Límite de correcciones para daily_submissions.
-- Cada participante puede corregir el reel_url hasta 2 veces por día.
-- Admin (Andrea) queda exento.

alter table public.daily_submissions
  add column if not exists correction_count int not null default 0;

create or replace function public.tg_daily_submissions_correction_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Admin puede editar libremente — la trigger es solo para participantes.
  if public.is_admin() then
    return new;
  end if;

  -- Solo cuenta como corrección si cambió el link del reel.
  if new.reel_url is distinct from old.reel_url then
    new.correction_count := coalesce(old.correction_count, 0) + 1;
    if new.correction_count > 2 then
      raise exception 'Ya usaste tus 2 correcciones para este día.'
        using errcode = 'P0001';
    end if;
  else
    -- Mantenemos el contador estable cuando solo cambian otros campos.
    new.correction_count := old.correction_count;
  end if;

  return new;
end $$;

drop trigger if exists trg_daily_submissions_correction_limit
  on public.daily_submissions;

create trigger trg_daily_submissions_correction_limit
  before update on public.daily_submissions
  for each row execute function public.tg_daily_submissions_correction_limit();
