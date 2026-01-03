-- Origin Korea Announcements Table Setup
-- Run this script in Supabase SQL Editor

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ko TEXT NOT NULL,
  content_en TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'notice' CHECK (type IN ('notice', 'update', 'event', 'important')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_popup BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_popup ON announcements(is_popup);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active announcements
CREATE POLICY "Anyone can read active announcements" ON announcements
  FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated users can read all announcements (for admin)
CREATE POLICY "Authenticated users can read all announcements" ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert announcements
CREATE POLICY "Admins can insert announcements" ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can update announcements
CREATE POLICY "Admins can update announcements" ON announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete announcements
CREATE POLICY "Admins can delete announcements" ON announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- Insert sample announcements (NO POPUP by default)
INSERT INTO announcements (title_ko, title_en, content_ko, content_en, type, is_pinned, is_popup, is_active)
VALUES
  (
    'Origin Korea 커뮤니티에 오신 것을 환영합니다',
    'Welcome to Origin Korea Community',
    'Origin Korea는 알고리즘 통화 LGNS를 기반으로 한 탈중앙화 금융 플랫폼입니다. 함께 성장하는 커뮤니티가 되기를 바랍니다.',
    'Origin Korea is a decentralized financial platform based on algorithmic currency LGNS. We hope to become a growing community together.',
    'notice',
    true,
    false,  -- NO POPUP
    true
  ),
  (
    'v318 업데이트 안내',
    'v318 Update Notice',
    '고래 추적 페이지가 개선되었습니다. 고래 지갑 추적과 대규모 거래 모니터링을 한 곳에서 확인하세요.',
    'Whale tracking page has been improved. Check whale wallet tracking and large transaction monitoring in one place.',
    'update',
    false,
    false,  -- NO POPUP
    true
  );

-- Verify setup
SELECT 'Announcements table created successfully!' AS status;
SELECT COUNT(*) AS total_announcements FROM announcements;
