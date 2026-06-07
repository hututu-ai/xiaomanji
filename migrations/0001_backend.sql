CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS jian (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  day_key TEXT NOT NULL,
  theme_id TEXT,
  poem_id TEXT,
  poet TEXT,
  title TEXT,
  image_key TEXT,
  card_json TEXT NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_jian_user_created ON jian(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jian_user_day ON jian(user_id, day_key);

CREATE TABLE IF NOT EXISTS sign_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  status TEXT NOT NULL,
  theme_id TEXT,
  jian_id TEXT,
  accepted_at INTEGER,
  completed_at INTEGER,
  makeup_at INTEGER,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, day_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sign_user_day ON sign_ledger(user_id, day_key);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reward_key TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  title TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  meta_json TEXT,
  UNIQUE(user_id, reward_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  jian_id TEXT,
  image_key TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  meta_json TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_shares_user_created ON shares(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS makeup_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_key TEXT NOT NULL,
  source TEXT,
  day_key TEXT,
  status TEXT NOT NULL,
  issued_at INTEGER NOT NULL,
  used_at INTEGER,
  expires_at INTEGER,
  meta_json TEXT,
  UNIQUE(user_id, token_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_makeup_tokens_user_status ON makeup_tokens(user_id, status);
