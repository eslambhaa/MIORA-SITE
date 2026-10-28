-- Longer text for each episode page (paragraphs separated by a blank line).
alter table public.resources add column details text check (details is null or char_length(details) <= 2000);

update public.resources set details = E'حلقة من بودكاست فنجان مع عبدالرحمن أبومالح، نُشرت في فبراير 2025، ومدتها نحو ساعتين وربع.\n\nتتناول ازدياد اهتمام الناس بالصحة النفسية، وهل يجب على الإنسان أن يعرف نفسه، والمفاهيم الخاطئة عن السعادة والنجاح، وكيف يفهم الإنسان ذاته، وأدوات تساعد على ذلك، ولماذا يخدع الإنسان نفسه.' where title = 'فنجان: كيف تفهم نفسك';
update public.resources set details = E'حلقة من بودكاست أبجورة، رحلة تأملية في الحزن والغضب والوحدة والحنين، وفكرة أن الحب بعد الفقد لا ينتهي بل يتغير شكله.\n\nيشارك فيها المقدّم 10 دروس تعلّمها عن الفقد خلال 15 عامًا.' where title = 'أبجورة: ماذا بعد الفقد؟';
update public.resources set details = E'حوار في بودكاست براح مع د. فريال حسام ود. دارين الجهني عن الصداقة الحقيقية بين التضحية والعطاء، وعن رسم الحدود في العلاقات.' where title = 'براح: الصداقة ورسم الحدود';
update public.resources set details = E'حلقة من بودكاست فنجان مع عبدالرحمن أبومالح، نُشرت في 2019، عن معنى الصحة النفسية ولماذا تستحق الاهتمام.' where title = 'فنجان: أهمية الصحة النفسية';
