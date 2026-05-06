-- Trigger que crea la fila en public.participants cuando se crea un user en auth.
-- Antes esto se hacía desde el callback del magic link, pero si el link fallaba
-- (otp_expired por prefetch del escáner de phishing) la fila no se creaba y
-- el user quedaba invisible para el admin.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo si el user trae metadata de signup completa
  if coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), '') <> ''
     and coalesce(nullif(new.raw_user_meta_data->>'instagram_handle', ''), '') <> '' then
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
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Backfill: crear filas de participants para los users que ya existen en auth
-- pero quedaron sin fila por el bug del callback.
-- ---------------------------------------------------------------------------
insert into public.participants
  (id, email, full_name, instagram_handle, rubro, followers_initial, state, role)
select
  u.id,
  u.email,
  nullif(u.raw_user_meta_data->>'full_name', ''),
  lower(nullif(u.raw_user_meta_data->>'instagram_handle', '')),
  nullif(u.raw_user_meta_data->>'rubro', ''),
  coalesce((u.raw_user_meta_data->>'followers_initial')::int, 0),
  'pending'::signup_state,
  'participant'::user_role
from auth.users u
left join public.participants p on p.id = u.id
where p.id is null
  and u.email is not null
  and coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), '') <> ''
  and coalesce(nullif(u.raw_user_meta_data->>'instagram_handle', ''), '') <> ''
on conflict (id) do nothing;
