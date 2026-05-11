-- pg_safeupdate (activo en este proyecto) rechaza DELETE sin WHERE.
-- refresh_leaderboard() hacía `delete from leaderboard;` y rompía cualquier
-- UPDATE en participants/checkpoints/sales_evidence porque el trigger
-- trg_refresh_lb_* abortaba con 21000 "DELETE requires a WHERE clause".

create or replace function public.refresh_leaderboard()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.leaderboard where participant_id is not null;
  insert into public.leaderboard (
    participant_id, full_name, instagram_handle,
    followers_gained, total_reach, total_interactions, total_sales_usd,
    pts_followers, pts_reach, pts_interactions, pts_sales, pts_total, position
  )
  select
    l.participant_id, l.full_name, l.instagram_handle,
    l.followers_gained, l.total_reach, l.total_interactions, l.total_sales_usd,
    l.pts_followers, l.pts_reach, l.pts_interactions, l.pts_sales, l.pts_total,
    row_number() over (order by l.pts_total desc, l.followers_gained desc) as position
  from public.compute_leaderboard() l;
end $$;
