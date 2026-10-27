create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "Admins can read their membership" on public.admins for select to authenticated using (user_id = (select auth.uid()));
grant select on public.admins to authenticated;
grant all on public.admins to service_role;

-- Called only from the auth trigger. The transaction lock also covers direct Auth API sign-ups.
create function private.bootstrap_admin() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(73190428);
  if exists (select 1 from public.admins) then
    raise exception 'Sign-ups are closed';
  end if;
  insert into public.admins(user_id) values (new.id);
  return new;
end;
$$;
revoke all on function private.bootstrap_admin() from public, anon, authenticated;
create trigger stillword_first_admin after insert on auth.users for each row execute function private.bootstrap_admin();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(slug) between 1 and 240),
  title text not null check (length(title) between 1 and 300),
  lede text not null default '', category text not null default 'Essays',
  cover_url text,
  content_html text not null default '', content_json jsonb not null default '{"type":"doc","content":[]}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  read_minutes integer not null default 1 check (read_minutes > 0),
  author_name text not null default 'Maxime Bourgault', author_role text not null default 'Writer',
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);
create index posts_published_at on public.posts(published_at desc) where status = 'published';
alter table public.posts enable row level security;
create policy "Published posts are public" on public.posts for select to anon, authenticated using (status = 'published');
create policy "Admins manage posts" on public.posts for all to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where user_id = (select auth.uid())));
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;

create function private.touch_post() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.touch_post() from public, anon, authenticated;
create trigger posts_updated before update on public.posts for each row execute function private.touch_post();

create table public.visitors (id uuid primary key, first_seen_at timestamptz not null default now());
create index visitors_first_seen on public.visitors(first_seen_at);
alter table public.visitors enable row level security;
create policy "Admins read visitors" on public.visitors for select to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())));
grant select on public.visitors to authenticated;
grant all on public.visitors to service_role;

create table public.post_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  type text not null check (type in ('view', 'read')),
  created_at timestamptz not null default now(),
  event_day date generated always as ((created_at at time zone 'UTC')::date) stored,
  unique(post_id, visitor_id, type, event_day)
);
create index post_events_created_at on public.post_events(created_at);
create index post_events_visitor on public.post_events(visitor_id);
alter table public.post_events enable row level security;
create policy "Admins read events" on public.post_events for select to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())));
grant select on public.post_events to authenticated;
grant all on public.post_events to service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/avif']);
create policy "Public post images" on storage.objects for select to anon, authenticated using (bucket_id = 'post-images');
create policy "Admins insert images" on storage.objects for insert to authenticated with check
  (bucket_id = 'post-images' and exists (select 1 from public.admins where user_id = (select auth.uid())));
create policy "Admins delete images" on storage.objects for delete to authenticated using
  (bucket_id = 'post-images' and exists (select 1 from public.admins where user_id = (select auth.uid())));

-- Aggregates in SQL avoid the REST API's row limit for busy sites. RLS still applies.
create function public.dashboard_activity() returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'visitors_per_day', (select jsonb_agg(jsonb_build_object('day', d.day::date, 'count',
      (select count(*) from public.visitors v where v.first_seen_at >= d.day and v.first_seen_at < d.day + interval '1 day')) order by d.day)
      from generate_series(date_trunc('day', now() at time zone 'UTC') at time zone 'UTC' - interval '13 days',
        date_trunc('day', now() at time zone 'UTC') at time zone 'UTC', interval '1 day') d(day)),
    'top_posts', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select p.id, p.title, count(e.id) filter (where e.type = 'view') as views,
        count(e.id) filter (where e.type = 'read') as reads
      from public.posts p left join public.post_events e on e.post_id = p.id
      where p.status = 'published' group by p.id order by reads desc, views desc, p.title limit 5
    ) t)
  );
$$;
revoke all on function public.dashboard_activity() from public, anon;
grant execute on function public.dashboard_activity() to authenticated;
