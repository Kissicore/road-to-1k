-- Trigger que crea la fila en public.participants cuando se crea un user en auth.
-- Tolerante a duplicados: si el IG handle o el email ya existen en participants,
-- no crea la fila pero tampoco rompe el alta del user en auth.users.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), '') <> ''
     and coalesce(nullif(new.raw_user_meta_data->>'instagram_handle', ''), '') <> '' then
    begin
      insert into public.participants
        (id, email, full_name, instagram_handle, rubro, followers_initial, state, role)
      values (
        new.id,
        new.email,
        nullif(new.raw_user_meta_data->>'full_name', ''),
        lower(nullif(new.raw_user_meta_data->>'instagram_handle', '')),
        nullif(new.raw_user_meta_data->>'rubro', ''),
        coalesce((new.raw_user_meta_data->>'followers_initial')::int, 0),
        'pending',
        'participant'
      );
    exception
      when unique_violation then
        null;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Backfill row-by-row: salta duplicados (IG handle o email repetido) y sigue
-- con los siguientes. Reporta totales por NOTICE.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  inserted_count int := 0;
  skipped_count int := 0;
begin
  for r in
    select
      u.id,
      u.email,
      nullif(u.raw_user_meta_data->>'full_name', '') as full_name,
      lower(nullif(u.raw_user_meta_data->>'instagram_handle', '')) as instagram_handle,
      nullif(u.raw_user_meta_data->>'rubro', '') as rubro,
      coalesce((u.raw_user_meta_data->>'followers_initial')::int, 0) as followers_initial
    from auth.users u
    left join public.participants p on p.id = u.id
    where p.id is null
      and u.email is not null
      and coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), '') <> ''
      and coalesce(nullif(u.raw_user_meta_data->>'instagram_handle', ''), '') <> ''
  loop
    begin
      insert into public.participants
        (id, email, full_name, instagram_handle, rubro, followers_initial, state, role)
      values
        (r.id, r.email, r.full_name, r.instagram_handle, r.rubro, r.followers_initial, 'pending', 'participant');
      inserted_count := inserted_count + 1;
    exception
      when unique_violation then
        skipped_count := skipped_count + 1;
        raise notice 'Skipped duplicate: % (handle=%)', r.email, r.instagram_handle;
    end;
  end loop;
  raise notice 'Backfill done. Inserted: %, Skipped: %', inserted_count, skipped_count;
end $$;
