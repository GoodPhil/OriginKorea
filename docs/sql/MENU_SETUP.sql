-- Menu Items Table for Origin Korea
-- Run this in your Supabase SQL Editor

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  href VARCHAR(255) NOT NULL,
  label_ko VARCHAR(100) NOT NULL,
  label_en VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  show_in_nav BOOLEAN NOT NULL DEFAULT true,
  show_in_footer BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items(sort_order);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read visible menu items
CREATE POLICY "Anyone can read visible menu items"
  ON menu_items FOR SELECT
  USING (true);

-- Policy: Only admins can update menu items
CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can insert menu items
CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete menu items
CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert default menu items (v318 structure)
-- Order: AI 분석, 분석, 비교 분석, 추적, 계산기, 참고링크, 문서, 커뮤니티, 멤버십, 공지
INSERT INTO menu_items (key, href, label_ko, label_en, icon, sort_order, is_visible, show_in_nav, show_in_footer)
VALUES
  ('ai-analysis', '/ai-analysis', 'AI 분석', 'AI Analysis', 'Brain', 1, true, true, true),
  ('analysis', '/analysis', '분석', 'Analysis', 'BarChart3', 2, true, true, true),
  ('comparison', '/comparison', '비교 분석', 'Comparison', 'GitCompare', 3, true, true, true),
  ('whale-monitor', '/whale-monitor', '추적', 'Tracking', 'Fish', 4, true, true, true),
  ('calculator', '/calculator', '계산기', 'Calculator', 'Calculator', 5, true, true, true),
  ('bookmarks', '/bookmarks', '참고링크', 'Bookmarks', 'BookmarkCheck', 6, true, true, true),
  ('docs', '/docs', '문서', 'Docs', 'BookOpen', 7, true, true, true),
  ('community', '/community', '커뮤니티', 'Community', 'Users', 8, true, true, true),
  ('membership', '/membership', '멤버십', 'Membership', 'Crown', 9, true, true, true),
  ('announcements', '/announcements', '공지', 'Announcements', 'Bell', 10, true, true, true)
ON CONFLICT (key) DO UPDATE SET
  href = EXCLUDED.href,
  label_ko = EXCLUDED.label_ko,
  label_en = EXCLUDED.label_en,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_menu_items_updated_at ON menu_items;
CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_items_updated_at();

-- Verify setup
SELECT 'Menu items table created successfully!' AS status;
SELECT * FROM menu_items ORDER BY sort_order;
