create table public.admins(id uuid primary key references auth.users on delete cascade,email text not null,role text not null default 'admin',created_at timestamptz default now());
create table public.categories(id uuid primary key default gen_random_uuid(),name_en text not null,name_ur text,slug text unique not null,is_active bool default true,sort_order int default 0);
create table public.videos(id uuid primary key default gen_random_uuid(),youtube_video_id text unique not null,youtube_url text not null,title text not null,description text,thumbnail_url text,channel_name text,duration text,
 category_id uuid references public.categories on delete set null,reciter_name text,is_featured bool default false,is_published bool default false,published_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());
create table public.site_settings(id int primary key default 1 check(id=1),website_name text default 'Babul Hawaij Layyah Party',website_name_ur text default 'باب الحوائج لیہ پارٹی',logo_url text,
 hero_heading text,hero_description text default 'A Digital Collection of Nohay, Azadari and the Remembrance of Karbala.',
 about_content text default 'Babul Hawaij Layyah Party is dedicated to preserving and sharing the tradition of Azadari, Noha recitation, and the remembrance of the sacrifices of Karbala. Through this digital platform, visitors can explore and watch our religious video collection.',
 contact_email text,contact_phone text,social_links jsonb default '{}');
insert into public.site_settings(id) values(1);
insert into public.categories(name_en,name_ur,slug,sort_order) values('Nohay','نوحے','nohay',1),('Muharram','محرم','muharram',2);
create index on public.videos(is_published,published_at desc);create index on public.videos(category_id);
create function public.is_admin() returns bool language sql security definer stable set search_path=public as $$select exists(select 1 from admins where id=auth.uid())$$;
create function public.touch() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end$$;
create trigger t before update on public.videos for each row execute function public.touch();
alter table admins enable row level security;alter table categories enable row level security;alter table videos enable row level security;alter table site_settings enable row level security;
create policy a_self on admins for select using(id=auth.uid());
create policy c_read on categories for select using(is_active or is_admin());create policy c_w on categories for all using(is_admin()) with check(is_admin());
create policy v_read on videos for select using(is_published or is_admin());create policy v_w on videos for all using(is_admin()) with check(is_admin());
create policy s_read on site_settings for select using(true);create policy s_w on site_settings for update using(is_admin()) with check(is_admin());
insert into storage.buckets(id,name,public) values('branding','branding',true);
create policy b_read on storage.objects for select using(bucket_id='branding');
create policy b_w on storage.objects for all using(bucket_id='branding' and public.is_admin()) with check(bucket_id='branding' and public.is_admin());
