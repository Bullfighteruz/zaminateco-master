-- ==========================================
-- ZAMINAT.eco — Database Schema
-- Paste this script into your Supabase SQL Editor to create tables.
-- ==========================================

-- 1. Profiles (User details, wallet balance, level)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  eco_coins integer default 0,
  level integer default 1,
  xp integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can read all profiles." 
  on public.profiles for select 
  using (true);

create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

-- Trigger to create profile when auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, eco_coins, level, xp)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    0,
    1,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. EcoPoints (Collection centers)
create table if not exists public.eco_points (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  accepted_materials text[], -- array of materials: PET, HDPE, Paper, Glass, Caps
  working_hours text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.eco_points enable row level security;

create policy "Anyone can view active EcoPoints."
  on public.eco_points for select
  using (is_active = true);


-- 3. Scans (AI Waste scan submissions)
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  image_url text,
  detected_items jsonb not null, -- JSON list of detected items
  total_weight_kg text,
  estimated_coins integer default 0,
  verification_status text default 'Pending', -- Pending, Verified, Rejected
  eco_point_id uuid references public.eco_points(id) on delete set null,
  project_pledged text, -- targeted EcoVote project id (e.g. 'school45')
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scans enable row level security;

create policy "Users can view their own scans."
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert scans."
  on public.scans for insert
  with check (auth.uid() = user_id);


-- 4. EcoActions (Cleanup events & participants)
create table if not exists public.eco_actions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  location_name text not null,
  latitude double precision,
  longitude double precision,
  xp_reward integer default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.eco_actions enable row level security;

create policy "Anyone can view EcoActions."
  on public.eco_actions for select
  using (true);

-- Event participants junction table
create table if not exists public.eco_action_participants (
  action_id uuid references public.eco_actions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (action_id, user_id)
);

alter table public.eco_action_participants enable row level security;

create policy "Users can view participants."
  on public.eco_action_participants for select
  using (true);

create policy "Users can register/unregister."
  on public.eco_action_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel registration."
  on public.eco_action_participants for delete
  using (auth.uid() = user_id);


-- 5. Seed initial mock EcoPoints for Tashkent
insert into public.eco_points (name, latitude, longitude, address, accepted_materials, working_hours)
values 
  ('Yunusobod EcoPoint', 41.3652, 69.2882, 'Yunusobod District, Block 4, Tashkent', array['Plastic', 'Paper', 'Metal', 'Glass'], '09:00 - 18:00'),
  ('Chilanzor Collection Center', 41.2825, 69.2084, 'Chilanzor District, Block 2, Tashkent', array['Plastic', 'Rubber', 'Paper'], '08:30 - 17:30'),
  ('Mirzo Ulugbek Point', 41.3284, 69.3242, 'Mirzo Ulugbek District, Buyuk Ipak Yuli St, Tashkent', array['Plastic', 'Metal', 'Glass'], '09:00 - 19:00')
on conflict do nothing;
