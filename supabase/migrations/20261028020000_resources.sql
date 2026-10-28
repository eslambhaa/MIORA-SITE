-- Curated Arabic sources and podcasts shown under the content library.
-- Public, read-only from the browser: rows are only links and short text.
create table public.resources (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('guide', 'podcast', 'video')),
  title text not null check (char_length(title) between 1 and 120),
  source text not null check (char_length(source) between 1 and 120),
  description text not null check (char_length(description) between 1 and 300),
  url text not null check (url ~ '^https://[^\s]+$' and char_length(url) <= 600),
  topic text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.resources enable row level security;

revoke all on table public.resources from anon, authenticated;
grant select on table public.resources to anon, authenticated;

create policy "resources_select_published" on public.resources
  for select to anon, authenticated
  using (published);

insert into public.resources (kind, title, source, description, url, topic, sort_order) values
  ('guide', 'التعامل مع الضغوط النفسية', 'منظمة الصحة العالمية، المكتب الإقليمي لشرق المتوسط',
   'صفحة عربية فيها نصائح عملية للتعامل مع الضغط، وتمرين تنفس قصير.',
   'https://www.emro.who.int/mhps/ar/dealing_with_stress.html', 'التوتر والضغط النفسي', 10),
  ('guide', 'القيام بما يهم في أوقات الضغط النفسي', 'منظمة الصحة العالمية',
   'دليل مصوّر بالعربية لمهارات التعامل مع الضغط، يتضمن تمرين تأريض (Grounding) يمكن اتباعه بالصور أو بالصوت.',
   'https://www.who.int/docs/default-source/mental-health/sh-2020-ara.pdf?sfvrsn=880a39b7_2', 'مهارات التعامل', 20),
  ('podcast', 'براح', 'Apple Podcasts',
   'بودكاست عربي يتناول الصحة النفسية والضغوط اليومية والعلاقات.',
   'https://podcasts.apple.com/ae/podcast/%D8%A8%D8%B1%D8%A7%D8%AD/id1838720442?l=ar', 'فهم المشاعر', 30),
  ('podcast', 'فنجان: أهمية الصحة النفسية', 'فنجان مع عبدالرحمن أبومالح',
   'حلقة عن معنى الصحة النفسية ولماذا تستحق الاهتمام.',
   'https://podcasts.apple.com/sa/podcast/167-%D8%A3%D9%87%D9%85%D9%8A%D8%A9-%D8%A7%D9%84%D8%B5%D8%AD%D8%A9-%D8%A7%D9%84%D9%86%D9%81%D8%B3%D9%8A%D8%A9/id985515827?i=1000458984615', 'فهم المشاعر', 40),
  ('podcast', 'فنجان: كيف تفهم نفسك', 'فنجان مع عبدالرحمن أبومالح',
   'حلقة عن فهم الذات ومعرفة ما يحرّكنا.',
   'https://podcasts.apple.com/iq/podcast/%D9%83%D9%8A%D9%81-%D8%AA%D9%81%D9%87%D9%85-%D9%86%D9%81%D8%B3%D9%83/id985515827?i=1000693880174', 'التأمل الذاتي', 50),
  ('podcast', 'بصائر', 'Apple Podcasts',
   'بودكاست عربي عن الصحة النفسية تقدمه سلمى المفتي. آخر حلقاته من 2022.',
   'https://podcasts.apple.com/us/podcast/%D8%A8%D8%B5%D8%A7%D8%A6%D8%B1/id1465335294', 'فهم المشاعر', 60),
  ('podcast', 'مواسم', 'Apple Podcasts',
   'بودكاست تثقيفي عن الصحة النفسية. آخر حلقاته من 2022.',
   'https://podcasts.apple.com/us/podcast/%D8%A8%D9%88%D8%AF%D9%83%D8%A7%D8%B3%D8%AA-%D9%85%D9%88%D8%A7%D8%B3%D9%85/id1558925134', 'فهم المشاعر', 70);
