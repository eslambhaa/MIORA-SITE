-- Phase 19, part 1: the addiction hotline joins the help numbers, so both the help page and
-- the new /addiction page show it, and the admin can edit it like the others.
-- Source: Egypt's Fund for Drug Control and Treatment of Addiction (Ministry of Social Solidarity),
-- hotline 16023, free and confidential, around the clock.
insert into public.emergency_contacts (country, title, number, note, sort_order, published)
select 'مصر', 'الخط الساخن لعلاج الإدمان', '16023', 'صندوق مكافحة وعلاج الإدمان، مجاني وسري، على مدار الساعة.', 40, true
where not exists (select 1 from public.emergency_contacts where number = '16023');
