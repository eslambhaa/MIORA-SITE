-- Videos from the same shows as the podcasts, played inside the site through youtube-nocookie.
insert into public.resources (kind, title, source, description, url, embed_url, topic, sort_order) values
  ('video', 'فنجان: كيف تفهم نفسك', 'بودكاست فنجان على YouTube',
   'حلقة عن ازدياد الاهتمام بالصحة النفسية، وكيف يفهم الإنسان ذاته، وأدوات تساعد على ذلك.',
   'https://www.youtube.com/watch?v=hdTdev3GVCw', 'https://www.youtube-nocookie.com/embed/hdTdev3GVCw', 'التأمل الذاتي', 110),
  ('video', 'أبجورة: ماذا بعد الفقد؟', 'بودكاست أبجورة على YouTube',
   'رحلة تأملية في الحزن والغضب والوحدة والحنين، ويشارك فيها المقدّم 10 دروس تعلّمها عن الفقد.',
   'https://www.youtube.com/watch?v=00EdCzams0c', 'https://www.youtube-nocookie.com/embed/00EdCzams0c', 'فهم المشاعر', 120),
  ('video', 'براح: الصداقة ورسم الحدود', 'بودكاست براح على YouTube',
   'حوار مع د. فريال حسام ود. دارين الجهني عن الصداقة الحقيقية بين التضحية والعطاء، ورسم الحدود.',
   'https://www.youtube.com/watch?v=gX6oybVJMNs', 'https://www.youtube-nocookie.com/embed/gX6oybVJMNs', 'العلاقات', 130);
