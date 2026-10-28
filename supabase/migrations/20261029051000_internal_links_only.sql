-- A notification or announcement link must stay inside the site. The older rule accepted "//evil.example"
-- (a slash, then path characters), which a browser and the router treat as another website.
alter table public.announcements
  add constraint announcements_link_internal check (link is null or link !~ '^//');
alter table public.notifications
  add constraint notifications_link_internal check (link is null or link !~ '^//');
