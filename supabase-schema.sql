-- ==========================================
-- ZAMINAT.eco — Complete Database Schema
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
  waste_collected double precision default 0.0,
  title text default 'Eco Cadet',
  mahalla text,
  school text,
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
  insert into public.profiles (id, email, full_name, avatar_url, eco_coins, level, xp, title, mahalla, school)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'firstName', 'Eco Hero'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '👩‍🌾'),
    0,
    1,
    0,
    'Eco Cadet',
    new.raw_user_meta_data->>'mahalla',
    new.raw_user_meta_data->>'school'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. EcoPoints / Collection points (Collection centers)
create table if not exists public.eco_points (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  accepted_materials text[], -- array of materials: Plastic, Paper, Metal, Glass, Rubber
  working_hours text,
  total_collected double precision default 0.0,
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
  registered_count integer default 0,
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


-- 5. Voting Projects (EcoVote)
create table if not exists public.voting_projects (
  id text primary key,
  title text not null,
  description text not null,
  image_url text,
  location text,
  required_materials integer default 1000,
  current_votes integer default 0,
  total_votes integer default 1000,
  category text default 'general', -- school, park, kindergarten, general
  deadline timestamp with time zone,
  status text default 'active', -- active, completed
  donation_target bigint default 0,
  donation_raised bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.voting_projects enable row level security;

create policy "Anyone can view voting projects."
  on public.voting_projects for select
  using (true);

-- User Votes junction table to prevent double voting
create table if not exists public.user_votes (
  project_id text references public.voting_projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  voted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (project_id, user_id)
);

alter table public.user_votes enable row level security;

create policy "Anyone can see votes."
  on public.user_votes for select
  using (true);

create policy "Users can place one vote per project."
  on public.user_votes for insert
  with check (auth.uid() = user_id);


-- 6. Social Mission Shop Products
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  price_coins integer not null,
  stock_count integer default 10,
  image_url text,
  category text, -- clothing, school, items, green
  co2_saved text,
  recycled_ratio text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

create policy "Anyone can view products."
  on public.products for select
  using (is_active = true);

-- Orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  items jsonb not null, -- JSON list of items purchased
  total_coins integer not null,
  shipping_address jsonb,
  status text default 'Pending', -- Pending, Shipped, Delivered
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

create policy "Users can view their own orders."
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can place orders."
  on public.orders for insert
  with check (auth.uid() = user_id);


-- 7. EcoStories (Posts and News)
create table if not exists public.eco_stories (
  id text primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  image_url text,
  category text default 'general', -- news, success, mahalla, eco-kids
  author text,
  likes_count integer default 0,
  comments_count integer default 0,
  language text default 'uz', -- uz, ru, en
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.eco_stories enable row level security;

create policy "Anyone can read eco stories."
  on public.eco_stories for select
  using (true);

-- Story Reactions/Likes
create table if not exists public.story_reactions (
  story_id text references public.eco_stories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reaction_type text default 'like',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (story_id, user_id)
);

alter table public.story_reactions enable row level security;

create policy "Anyone can see reactions."
  on public.story_reactions for select
  using (true);

create policy "Authenticated users can react."
  on public.story_reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their reaction."
  on public.story_reactions for delete
  using (auth.uid() = user_id);

-- Story Comments
create table if not exists public.story_comments (
  id uuid default gen_random_uuid() primary key,
  story_id text references public.eco_stories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  user_name text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.story_comments enable row level security;

create policy "Anyone can read comments."
  on public.story_comments for select
  using (true);

create policy "Authenticated users can comment."
  on public.story_comments for insert
  with check (auth.uid() = user_id);


-- ==========================================
-- 8. Seed initial mock data matching lib/mockData.ts
-- ==========================================

-- Seed EcoPoints
insert into public.eco_points (name, latitude, longitude, address, accepted_materials, working_hours, total_collected)
values 
  ('Yunusobod EcoPoint', 41.3652, 69.2882, 'Yunusobod District, Block 4, Tashkent', array['Plastic', 'Paper', 'Metal', 'Glass'], '09:00 - 18:00', 456.8),
  ('Chilanzor Collection Center', 41.2825, 69.2084, 'Chilanzor District, Block 2, Tashkent', array['Plastic', 'Rubber', 'Paper'], '08:30 - 17:30', 890.2),
  ('Mirzo Ulugbek Point', 41.3284, 69.3242, 'Mirzo Ulugbek District, Buyuk Ipak Yuli St, Tashkent', array['Plastic', 'Metal', 'Glass'], '09:00 - 19:00', 1250.5)
on conflict do nothing;

-- Seed Voting Projects
insert into public.voting_projects (id, title, description, image_url, location, required_materials, current_votes, total_votes, category, deadline, status, donation_target, donation_raised)
values
  ('1', 'New Playground for School #45', 'Transform recycled plastic and rubber into colorful playground equipment for 500+ children', '/images/New Playground for School.jpg', 'Chilonzor District', 2500, 1847, 2500, 'school', now() + interval '30 days', 'active', 15000000, 8500000),
  ('2', 'Eco-Park Benches from Recycled Plastic and Tires', 'Create sustainable seating areas from recycled plastic and tires in Alisher Navoi Park', '/images/eco-park-benches.jpg', 'Alisher Navoi Park', 1200, 956, 1500, 'park', now() + interval '45 days', 'active', 8000000, 3200000),
  ('3', 'Kindergarten Garden Path', 'Build safe walking paths using recycled plastic and rubber materials for little ones', '/images/kindergarten-garden-path.jpg', 'Mirzo Ulugbek District', 800, 623, 1000, 'kindergarten', now() + interval '15 days', 'active', 5000000, 5000000)
on conflict do nothing;

-- Seed EcoActions (Events)
insert into public.eco_actions (title, description, event_date, location_name, latitude, longitude, xp_reward, registered_count)
values
  ('Yunusobod Central Park Cleanup', 'Join fellow eco-volunteers for a massive waste collection drive in Yunusobod. Help segregate materials.', now() + interval '3 days', 'Yunusobod Central Park, Tashkent', 41.3652, 69.2882, 50, 42),
  ('Chilonzor Mahalla Recycling Drive', 'Drop off your sorted plastics, paper, and caps. Earn double Eco Coins today!', now() + interval '5 days', 'Chilonzor 3rd Block Mahalla, Tashkent', 41.2825, 69.2084, 30, 28),
  ('Tashkent Green Planting Action', 'Plant trees and create sustainable paths using eco-tiles produced from our previous campaigns.', now() + interval '12 days', 'Tashkent Botanical Garden, Tashkent', 41.3284, 69.3242, 100, 156)
on conflict do nothing;

-- Seed Shop Products
insert into public.products (id, name, description, price_coins, stock_count, image_url, category, co2_saved, recycled_ratio)
values
  ('p1', 'Recycled Plastic Eco-Cup', 'A durable, reusable coffee cup made entirely from recycled food-grade PP plastic.', '/images/eco-cup.jpg', 150, 12, 'items', '2.4 kg CO2', '100% Recycled'),
  ('p2', 'ZAMINAT Volunteer T-Shirt', 'Premium organic cotton t-shirt featuring the ZAMINAT Eco-Warrior graphics.', '/images/tshirt.png', 250, 8, 'clothing', '1.2 kg CO2', '30% Recycled'),
  ('p3', 'EcoKids School Ruler', 'Durable 30cm ruler made from recycled HDPE bottle caps collected by schools.', '/images/ruler.jpg', 50, 45, 'school', '0.5 kg CO2', '80% Recycled'),
  ('p4', 'Recycled Rubber Coaster Set', 'Set of 4 stylish cup coasters manufactured from processed discarded car tires.', '/images/coasters.jpg', 100, 20, 'items', '1.8 kg CO2', '100% Recycled')
on conflict do nothing;

-- Seed EcoStories
insert into public.eco_stories (id, title, slug, content, image_url, category, author, likes_count, comments_count, language)
values
  ('s1', 'How Yunusobod Mahalla Recycled 1 Ton of Plastic', 'how-yunusobod-recycled-1-ton', 'Through the coordinate efforts of schools, local mahalla committees, and our EcoScan app, Yunusobod citizens successfully collected and diverted 1,000 kg of plastic. The collected PET and HDPE were loaded directly to the Zaminat production site to be turned into benches and tile squares.', '/images/how-yunusobod-recycled-1-ton.jpg', 'mahalla', 'Sardor Rahim', 156, 12, 'uz'),
  ('s2', 'EcoKids: Interactive Recycling Lessons in Tashkent', 'ecokids-interactive-recycling', 'The EcoKids program launched educational workshops in five public schools, using mobile gamification to motivate students. Children learned resin codes, scanned materials using cameras, and participated in direct mahalla competitions.', '/images/ecokids-lessons.jpg', 'eco-kids', 'Zola Karimova', 94, 8, 'ru')
on conflict do nothing;

-- 9. Global Impact Stats
create table if not exists public.global_impact_stats (
  id serial primary key,
  total_plastic_kg double precision default 0.0,
  total_rubber_kg double precision default 0.0,
  total_paper_kg double precision default 0.0,
  benches_created integer default 0,
  tiles_created integer default 0,
  co2_saved_kg double precision default 0.0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.global_impact_stats enable row level security;

create policy "Anyone can view global impact stats."
  on public.global_impact_stats for select
  using (true);

-- Seed initial global impact stats
insert into public.global_impact_stats (id, total_plastic_kg, total_rubber_kg, total_paper_kg, benches_created, tiles_created, co2_saved_kg)
values (1, 1420.5, 950.0, 680.0, 18, 235, 1850.4)
on conflict (id) do update set
  total_plastic_kg = excluded.total_plastic_kg,
  total_rubber_kg = excluded.total_rubber_kg,
  total_paper_kg = excluded.total_paper_kg,
  benches_created = excluded.benches_created,
  tiles_created = excluded.tiles_created,
  co2_saved_kg = excluded.co2_saved_kg;
