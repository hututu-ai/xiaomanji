CREATE TABLE IF NOT EXISTS media_blobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  media_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  data_base64 TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  meta_json TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_media_blobs_user_created ON media_blobs(user_id, created_at DESC);
