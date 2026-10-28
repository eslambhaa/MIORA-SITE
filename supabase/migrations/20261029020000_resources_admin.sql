-- Admin dashboard part 3: episodes (videos and podcasts) are managed from the dashboard,
-- and the link checker keeps its results in a separate admin-only table.
-- Privacy rule (binding): nothing here touches journal text, assistant chats, assessment results or mood logs.

-- 1. Every playable row must have a way to play: a video needs its player address; a podcast needs
--    a player address or a direct audio file. Topics are the same list the library filters by.
alter table public.resources
  add constraint resources_playable check (
    kind = 'guide'
    or (kind = 'video' and embed_url is not null)
    or (kind = 'podcast' and (embed_url is not null or audio_url is not null))
  ),
  add constraint resources_topic_known check (
    topic is null or topic in ('فهم المشاعر', 'التوتر والضغط النفسي', 'مهارات التعامل', 'النوم والراحة', 'التأمل الذاتي', 'العادات الصحية', 'الوعي بالإدمان', 'العلاقات', 'طلب المساعدة', 'تغيير العادات')
  ),
  add column updated_at timestamptz not null default now();

-- "Last edited" moves only when content changes, not when the link checker stores a result.
create trigger resources_set_updated_at
  before update of kind, title, source, description, details, url, embed_url, audio_url, topic, sort_order, published
  on public.resources
  for each row execute function private.set_updated_at();

-- 2. Admins read every row (the public still sees published ones) and write with limited columns.
drop policy "resources_select_published" on public.resources;

create policy "resources_select_public" on public.resources
  for select to anon using (published);

create policy "resources_select_published_or_admin" on public.resources
  for select to authenticated
  using (published or exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

grant insert (kind, title, source, description, details, url, embed_url, audio_url, topic, sort_order, published)
  on table public.resources to authenticated;
-- The kind never changes after creation, so the page address (/content/video/1 or /content/podcast/1) stays valid.
grant update (title, source, description, details, url, embed_url, audio_url, topic, sort_order, published)
  on table public.resources to authenticated;
grant delete on table public.resources to authenticated;

create policy "resources_insert_admin" on public.resources
  for insert to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "resources_update_admin" on public.resources
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- Only hidden rows can be deleted; a published episode is hidden first.
create policy "resources_delete_admin_hidden" on public.resources
  for delete to authenticated
  using (not published and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- 3. Link check results: one row per episode, written only by the admin-media-tools function (service role),
--    readable only by admins. Status is ok, failed or unknown; detail is short codes such as video_removed.
create table public.resource_checks (
  resource_id bigint primary key references public.resources (id) on delete cascade,
  status text not null check (status in ('ok', 'failed', 'unknown')),
  detail text not null default '' check (char_length(detail) <= 200),
  checked_at timestamptz not null default now()
);

alter table public.resource_checks enable row level security;
revoke all on table public.resource_checks from anon, authenticated;
grant select on table public.resource_checks to authenticated;

create policy "resource_checks_select_admin" on public.resource_checks
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
