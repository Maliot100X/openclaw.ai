-- OpenClaw AI Database Schema
-- Run this in Supabase SQL Editor

-- Users table - stores Farcaster users and wallet addresses
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- FID as string or wallet address
  fid INTEGER UNIQUE, -- Farcaster ID
  username TEXT NOT NULL DEFAULT 'anon',
  display_name TEXT,
  pfp_url TEXT,
  bio TEXT,
  addresses TEXT[] DEFAULT '{}', -- Array of verified Ethereum addresses
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens table - Base and Zora tokens
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL, -- Contract address
  chain TEXT NOT NULL DEFAULT 'base', -- 'base' or 'zora'
  name TEXT NOT NULL DEFAULT 'Unknown Token',
  symbol TEXT NOT NULL DEFAULT '???',
  image_url TEXT,
  decimals INTEGER DEFAULT 18,
  verified BOOLEAN DEFAULT false,
  total_supply TEXT,
  market_cap_usd NUMERIC,
  price_usd NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address, chain)
);

-- Boosts table - token boosts for spotlight
CREATE TABLE IF NOT EXISTS boosts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id INTEGER NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
  price_usd NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  transaction_hash TEXT, -- Base transaction hash
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table - premium subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL, -- Wallet address of subscriber
  plan TEXT NOT NULL CHECK (plan IN ('trial', 'premium')),
  transaction_hash TEXT, -- Base transaction hash
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_boosts_active ON boosts(is_active, end_time) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_boosts_user ON boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_token ON boosts(token_id);
CREATE INDEX IF NOT EXISTS idx_boosts_tier ON boosts(tier);
CREATE INDEX IF NOT EXISTS idx_boosts_transaction ON boosts(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_chain_address ON tokens(chain, address);
CREATE INDEX IF NOT EXISTS idx_users_fid ON users(fid);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_transaction ON subscriptions(transaction_hash);

-- Leaderboard view - top boosted tokens
CREATE OR REPLACE VIEW leaderboard_coins AS
SELECT 
  t.id,
  t.address,
  t.name,
  t.symbol,
  t.chain,
  t.image_url,
  COUNT(b.id) as boost_count,
  SUM(b.price_usd) as total_boosted_usd,
  MAX(b.tier) as max_tier,
  MAX(b.created_at) as last_boosted
FROM tokens t
INNER JOIN boosts b ON t.id = b.token_id
WHERE b.created_at > NOW() - INTERVAL '30 days'
GROUP BY t.id, t.address, t.name, t.symbol, t.chain, t.image_url
ORDER BY total_boosted_usd DESC, boost_count DESC
LIMIT 100;

-- Leaderboard view - top buyers/boosters
CREATE OR REPLACE VIEW leaderboard_buyers AS
SELECT 
  u.id,
  u.fid,
  u.username,
  u.display_name,
  u.pfp_url,
  COUNT(b.id) as boost_count,
  SUM(b.price_usd) as total_spent_usd,
  MAX(b.tier) as max_tier_purchased,
  MAX(b.created_at) as last_boost
FROM users u
INNER JOIN boosts b ON u.id = b.user_id
WHERE b.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.fid, u.username, u.display_name, u.pfp_url
ORDER BY total_spent_usd DESC, boost_count DESC
LIMIT 100;

-- Function to automatically expire old boosts
CREATE OR REPLACE FUNCTION expire_old_boosts()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE boosts
  SET is_active = false
  WHERE is_active = true AND end_time < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'Farcaster users and wallet addresses';
COMMENT ON TABLE tokens IS 'Base and Zora tokens that can be boosted';
COMMENT ON TABLE boosts IS 'Token boosts for ClawKing Spotlight feature';
COMMENT ON TABLE subscriptions IS 'Premium subscription records';
COMMENT ON VIEW leaderboard_coins IS 'Top boosted tokens in last 30 days';
COMMENT ON VIEW leaderboard_buyers IS 'Top boosters/buyers in last 30 days';
