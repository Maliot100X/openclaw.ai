-- ============================================
-- ClawAI King Booster - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  fid bigint unique not null,
  username text not null,
  display_name text,
  pfp_url text,
  bio text,
  custody_address text,
  verified_addresses jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_fid on users(fid);
create index if not exists idx_users_username on users(username);

-- ============================================
-- TOKENS TABLE
-- ============================================
create table if not exists tokens (
  id uuid primary key default uuid_generate_v4(),
  address text not null,
  chain text not null check (chain in ('base', 'zora', 'ethereum')),
  name text not null,
  symbol text not null,
  image_url text,
  decimals int default 18,
  verified boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(address, chain)
);

create index if not exists idx_tokens_chain on tokens(chain);
create index if not exists idx_tokens_address on tokens(address);

-- ============================================
-- BOOSTS TABLE
-- ============================================
create table if not exists boosts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  token_id uuid references tokens(id) on delete cascade,
  tier int not null check (tier in (1, 2, 3)),
  price_usd numeric(10, 2) not null,
  duration_minutes int not null,
  start_time timestamptz not null default now(),
  end_time timestamptz not null,
  is_active boolean default true,
  transaction_hash text,
  created_at timestamptz default now()
);

create index if not exists idx_boosts_active on boosts(is_active) where is_active = true;
create index if not exists idx_boosts_end_time on boosts(end_time);
create index if not exists idx_boosts_user on boosts(user_id);
create index if not exists idx_boosts_token on boosts(token_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  plan text not null check (plan in ('trial', 'premium')),
  status text not null check (status in ('active', 'expired', 'cancelled')),
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  transaction_hash text,
  created_at timestamptz default now()
);

create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_subscriptions_status on subscriptions(status);

-- ============================================
-- LEADERBOARD VIEW
-- ============================================
create or replace view leaderboard_coins as
select 
  t.id as token_id,
  t.name,
  t.symbol,
  t.chain,
  t.image_url,
  count(b.id) as boost_count,
  sum(b.price_usd) as total_spent,
  max(b.created_at) as last_boosted
from tokens t
join boosts b on b.token_id = t.id
where b.created_at > now() - interval '7 days'
group by t.id
order by boost_count desc, total_spent desc;

create or replace view leaderboard_buyers as
select 
  u.id as user_id,
  u.fid,
  u.username,
  u.pfp_url,
  count(b.id) as boosts_bought,
  sum(b.price_usd) as total_spent
from users u
join boosts b on b.user_id = u.id
where b.created_at > now() - interval '7 days'
group by u.id
order by boosts_bought desc, total_spent desc;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get active boosts
create or replace function get_active_boosts()
returns table (
  id uuid,
  token_name text,
  token_symbol text,
  token_image text,
  tier int,
  time_remaining interval,
  user_username text
) as $$
begin
  return query
  select 
    b.id,
    t.name,
    t.symbol,
    t.image_url,
    b.tier,
    b.end_time - now(),
    u.username
  from boosts b
  join tokens t on t.id = b.token_id
  join users u on u.id = b.user_id
  where b.is_active = true
    and b.end_time > now()
  order by b.tier desc, b.end_time asc;
end;
$$ language plpgsql;

-- Function to deactivate expired boosts
create or replace function deactivate_expired_boosts()
returns int as $$
declare
  affected_count int;
begin
  update boosts
  set is_active = false
  where is_active = true
    and end_time < now();
  
  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$ language plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table users enable row level security;
alter table tokens enable row level security;
alter table boosts enable row level security;
alter table subscriptions enable row level security;

-- Public read access to tokens
create policy "Tokens are viewable by everyone" on tokens
  for select using (true);

-- Public read access to active boosts
create policy "Active boosts are viewable by everyone" on boosts
  for select using (is_active = true);

-- Users can view their own data
create policy "Users can view own data" on users
  for select using (true);

-- Users can update their own data
create policy "Users can update own data" on users
  for update using (auth.uid()::text = id::text);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
-- Uncomment to add sample data
/*
insert into users (fid, username, display_name, pfp_url) values
  (12345, 'clawuser', 'Claw User', 'https://via.placeholder.com/120/FF6B35/fff'),
  (67890, 'whale', 'Whale', 'https://via.placeholder.com/120/7C3AED/fff');

insert into tokens (address, chain, name, symbol, image_url, verified) values
  ('0x1234...', 'base', 'Based AI', 'BAI', 'https://via.placeholder.com/100/FF6B35/fff', true),
  ('0x5678...', 'zora', 'Zorb', 'ZORB', 'https://via.placeholder.com/100/5B21B6/fff', true);
*/
