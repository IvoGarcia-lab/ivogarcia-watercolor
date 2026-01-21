-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Ratings Table
create table if not exists public.ratings (
  id uuid default uuid_generate_v4() primary key,
  painting_id uuid references public.paintings(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  ip_hash text, -- Optional: to prevent simple spam without login
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Comments Table
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  painting_id uuid references public.paintings(id) on delete cascade not null,
  user_name text not null,
  content text not null,
  is_approved boolean default true, -- Auto-approve for now, can change to false for moderation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS Policies (Row Level Security)
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- Allow anyone to READ ratings/comments
create policy "Public ratings are viewable by everyone" on public.ratings
  for select using (true);

create policy "Public comments are viewable by everyone" on public.comments
  for select using (true);

-- Allow anyone to INSERT ratings/comments (Anon)
create policy "Anyone can insert ratings" on public.ratings
  for insert with check (true);

create policy "Anyone can insert comments" on public.comments
  for insert with check (true);

-- 4. Site Content Table (CMS Phase)
create table if not exists public.site_content (
  slug text primary key, -- e.g., 'author-bio', 'process-intro'
  content text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_content enable row level security;

create policy "Public content is viewable by everyone" on public.site_content
  for select using (true);
  
-- Only authenticated admins can update content (assuming usage of Supabase Auth for admin later)
-- For now allowing public/anon update for ease of setup if you don't use strict Auth, 
-- BUT recommended to restrict this later.
create policy "Anyone can update content" on public.site_content
  for update using (true);
  
-- Initial Seed Content
insert into public.site_content (slug, content) values
('author-bio', 'O Ivo Garcia é um artista apaixonado pela fluidez da aguarela...'),
('process-intro', 'O meu processo criativo começa com a observação da natureza...')
on conflict (slug) do nothing;
