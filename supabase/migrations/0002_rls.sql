-- Row-Level Security: participantes ven sólo lo suyo, admin ve todo,
-- ranking público es lectura libre.

alter table public.challenge          enable row level security;
alter table public.participants       enable row level security;
alter table public.daily_submissions  enable row level security;
alter table public.checkpoints        enable row level security;
alter table public.sales_evidence     enable row level security;
alter table public.leaderboard        enable row level security;

-- Challenge: lectura pública. Solo admin escribe.
create policy "challenge readable by anyone"
  on public.challenge for select using (true);

create policy "challenge writable by admin"
  on public.challenge for all using (public.is_admin()) with check (public.is_admin());

-- Participants: cada uno lee su propio row + ranking público lee nombre/handle.
create policy "participant reads own row"
  on public.participants for select
  using (id = auth.uid() or public.is_admin());

create policy "participant inserts own row on signup"
  on public.participants for insert
  with check (id = auth.uid());

create policy "participant updates own row (limited)"
  on public.participants for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "admin all on participants"
  on public.participants for all
  using (public.is_admin()) with check (public.is_admin());

-- Daily submissions
create policy "submissions read own"
  on public.daily_submissions for select
  using (participant_id = auth.uid() or public.is_admin());

create policy "submissions insert own"
  on public.daily_submissions for insert
  with check (participant_id = auth.uid());

create policy "submissions update own"
  on public.daily_submissions for update
  using (participant_id = auth.uid())
  with check (participant_id = auth.uid());

create policy "admin all on submissions"
  on public.daily_submissions for all
  using (public.is_admin()) with check (public.is_admin());

-- Checkpoints
create policy "checkpoints read own"
  on public.checkpoints for select
  using (participant_id = auth.uid() or public.is_admin());

create policy "checkpoints insert own"
  on public.checkpoints for insert
  with check (participant_id = auth.uid());

create policy "checkpoints update own"
  on public.checkpoints for update
  using (participant_id = auth.uid())
  with check (participant_id = auth.uid());

create policy "admin all on checkpoints"
  on public.checkpoints for all
  using (public.is_admin()) with check (public.is_admin());

-- Sales evidence
create policy "sales read own"
  on public.sales_evidence for select
  using (participant_id = auth.uid() or public.is_admin());

create policy "sales insert own"
  on public.sales_evidence for insert
  with check (participant_id = auth.uid());

create policy "admin all on sales"
  on public.sales_evidence for all
  using (public.is_admin()) with check (public.is_admin());

-- Leaderboard: lectura pública (sin emails, solo lo expuesto en columnas).
create policy "leaderboard public read"
  on public.leaderboard for select
  using (true);

create policy "leaderboard admin write"
  on public.leaderboard for all
  using (public.is_admin()) with check (public.is_admin());
