-- ScrollRead v2 - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================================
-- ARTICLES TABLE (Read It Later)
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  site_name TEXT,
  image_url TEXT,
  saved_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000,
  last_read_at BIGINT,
  progress INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- READING PROGRESS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS reading_progress (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('book', 'article')),
  current_page INT NOT NULL DEFAULT 0,
  total_pages INT,
  last_read_at BIGINT NOT NULL,
  completed_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- SETTINGS TABLE (Optional - for multi-device sync)
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY DEFAULT 'default-user',
  theme TEXT NOT NULL DEFAULT 'dark',
  tts_engine TEXT NOT NULL DEFAULT 'browser',
  browser_voice TEXT,
  elevenlabs_voice TEXT,
  elevenlabs_key TEXT,
  wpm INT NOT NULL DEFAULT 180,
  auto_advance BOOLEAN DEFAULT true,
  highlight_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS articles_saved_at_idx ON articles(saved_at DESC);
CREATE INDEX IF NOT EXISTS articles_is_archived_idx ON articles(is_archived);
CREATE INDEX IF NOT EXISTS reading_progress_last_read_at_idx ON reading_progress(last_read_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- For personal use, we'll allow all operations
-- In a multi-user app, you'd add user_id column and filter by auth.uid()

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single user)
CREATE POLICY "Allow all operations on articles" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reading_progress" ON reading_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reading_progress_updated_at ON reading_progress;
CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
