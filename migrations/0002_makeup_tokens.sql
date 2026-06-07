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
