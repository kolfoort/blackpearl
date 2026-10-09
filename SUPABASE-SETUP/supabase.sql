create table if not exists public.admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
create policy "own membership" on public.admins for select to authenticated using(user_id=auth.uid());
create function public.is_car_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admins where user_id=auth.uid()); $$;
revoke all on function public.is_car_admin() from public;
grant execute on function public.is_car_admin() to authenticated;
create table public.cars(
 id uuid primary key default gen_random_uuid(), title text not null, year integer, mileage integer, price numeric,
 horsepower integer, fuel text, transmission text, engine text, body text, color text default 'Zwart',
 description text default '', options text default '', photos jsonb not null default '[]',
 published boolean not null default false, status text not null default 'Te koop' check(status in ('Te koop','Gereserveerd','Verkocht')),
 created_at timestamptz default now());
alter table public.cars enable row level security;
create policy "published cars" on public.cars for select to anon,authenticated using(published=true);
create policy "admin cars" on public.cars for all to authenticated using(public.is_car_admin()) with check(public.is_car_admin());
grant select on public.cars to anon;
grant select,insert,update,delete on public.cars to authenticated;
grant select on public.admins to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('car-photos','car-photos',true,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "admin photo insert" on storage.objects for insert to authenticated with check(bucket_id='car-photos' and public.is_car_admin());
create policy "admin photo update" on storage.objects for update to authenticated using(bucket_id='car-photos' and public.is_car_admin()) with check(bucket_id='car-photos' and public.is_car_admin());
create policy "admin photo delete" on storage.objects for delete to authenticated using(bucket_id='car-photos' and public.is_car_admin());
create policy "admin photo list" on storage.objects for select to authenticated using(bucket_id='car-photos' and public.is_car_admin());
insert into public.cars(title,year,mileage,price,horsepower,fuel,body,photos,description,published) values
('Porsche 911 992.1',2024,7987,224995,480,'Benzine','Coupé','["assets/car-0.png","assets/car-0-rear.png"]','Zwarte Porsche 911 992.1. Afbeeldingen zijn illustratieve mockups; uitvoering en opties worden bevestigd bij aanvraag.',true),
('Audi RS6 Avant',2025,9565,139500,630,'Benzine','Stationwagen','["assets/car-1.png","assets/car-1-rear.png"]','Zwarte Audi RS6 Avant. Afbeeldingen zijn illustratieve mockups; uitvoering en opties worden bevestigd bij aanvraag.',true),
('Range Rover Autobiography Hybrid',2026,4323,155500,550,'Hybride','SUV','["assets/car-2.png","assets/car-2-rear.png"]','Zwarte Range Rover Autobiography Hybrid. Afbeeldingen zijn illustratieve mockups; uitvoering en opties worden bevestigd bij aanvraag.',true);
