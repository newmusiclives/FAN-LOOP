-- FANLOOP Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  genre TEXT,
  bio TEXT,
  image_url TEXT,
  brand_config TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL REFERENCES artists(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'pre-save',
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  headline TEXT,
  subheadline TEXT,
  image_url TEXT,
  brand_config TEXT DEFAULT '{}',
  share_messages TEXT DEFAULT '{}',
  reward_tiers TEXT DEFAULT '[]',
  config TEXT DEFAULT '{}',
  fan_count INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  email TEXT NOT NULL,
  name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by INTEGER REFERENCES fans(id),
  referral_count INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,
  verification_token TEXT,
  ip_address TEXT,
  device_fingerprint TEXT,
  city TEXT,
  country TEXT,
  source TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(campaign_id, email)
);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  referrer_id INTEGER NOT NULL REFERENCES fans(id),
  referred_id INTEGER NOT NULL REFERENCES fans(id),
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  tier_name TEXT NOT NULL,
  referrals_required INTEGER NOT NULL,
  description TEXT,
  reward_type TEXT DEFAULT 'digital',
  reward_value TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reward_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fan_id INTEGER NOT NULL REFERENCES fans(id),
  reward_id INTEGER NOT NULL REFERENCES rewards(id),
  status TEXT DEFAULT 'pending',
  claimed_at TEXT DEFAULT (datetime('now')),
  fulfilled_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER REFERENCES campaigns(id),
  fan_id INTEGER REFERENCES fans(id),
  event_type TEXT NOT NULL,
  event_data TEXT DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fan_tags (
  fan_id INTEGER NOT NULL REFERENCES fans(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (fan_id, tag_id)
);

CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL REFERENCES artists(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config TEXT DEFAULT '{}',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fraud_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fan_id INTEGER NOT NULL REFERENCES fans(id),
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  reason TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  fan_id INTEGER NOT NULL REFERENCES fans(id),
  period TEXT NOT NULL DEFAULT 'alltime',
  rank INTEGER NOT NULL,
  referral_count INTEGER NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(campaign_id, fan_id, period)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fans_campaign ON fans(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fans_referral_code ON fans(referral_code);
CREATE INDEX IF NOT EXISTS idx_fans_referred_by ON fans(referred_by);
CREATE INDEX IF NOT EXISTS idx_fans_email ON fans(email);
CREATE INDEX IF NOT EXISTS idx_referrals_campaign ON referrals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON analytics_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist ON campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON fraud_flags(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_campaign_period ON leaderboard_cache(campaign_id, period);
CREATE INDEX IF NOT EXISTS idx_reward_claims_status ON reward_claims(status);
