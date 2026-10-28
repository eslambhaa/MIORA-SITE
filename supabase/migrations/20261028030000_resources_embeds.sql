-- Videos and podcasts play inside the site, so each row carries a player address.
-- Only these two player hosts are accepted, matching the site's Content Security Policy.
alter table public.resources
  add column embed_url text
  check (
    embed_url is null or (
      char_length(embed_url) <= 600
      and embed_url ~ '^https://(embed\.podcasts\.apple\.com/|www\.youtube-nocookie\.com/embed/)[A-Za-z0-9%._~:/?#@!$&()*+,;=-]+$'
    )
  );

-- The official guides move to a "source" line at the end of the related articles.
delete from public.resources where kind = 'guide';

insert into public.resources (kind, title, source, description, url, topic, sort_order) values
  ('podcast', 'أبجورة', 'Apple Podcasts',
   'بودكاست عربي في المجتمع والثقافة، ومن حلقاته ما يتناول المشاعر والفقد والحنين.',
   'https://podcasts.apple.com/us/podcast/%D8%A8%D9%88%D8%AF%D9%83%D8%A7%D8%B3%D8%AA-%D8%A3%D8%A8%D8%AC%D9%88%D8%B1%D8%A9/id1272687671', 'فهم المشاعر', 80);

update public.resources
  set embed_url = replace(url, 'https://podcasts.apple.com/', 'https://embed.podcasts.apple.com/')
  where kind = 'podcast';
