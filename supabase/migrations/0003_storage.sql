-- Storage bucket para capturas del primer segundo de los reels.
-- Privado: solo el dueño y admin pueden leer.

insert into storage.buckets (id, name, public)
values ('hooks', 'hooks', false)
on conflict (id) do nothing;

create policy "hook upload by owner"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'hooks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "hook read by owner or admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'hooks'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "hook update by owner"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'hooks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
