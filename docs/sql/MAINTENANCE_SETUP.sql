-- =====================================================
-- Origin Korea - 점검 모드 & 사이트 설정 테이블
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- 1. 사이트 설정 테이블 생성
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 정책 설정
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (점검 모드 확인용)
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  USING (true);

-- 관리자만 수정 가능
CREATE POLICY "Only admins can update site settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 관리자만 삽입 가능
CREATE POLICY "Only admins can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 3. 기본 점검 모드 설정 삽입
INSERT INTO site_settings (key, value)
VALUES (
  'maintenance',
  '{
    "maintenance_mode": false,
    "maintenance_message_ko": "서비스 점검 중입니다. 잠시 후 다시 접속해주세요.",
    "maintenance_message_en": "We are currently under maintenance. Please try again later.",
    "maintenance_end_time": null,
    "updated_at": null,
    "updated_by": null
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 4. 페이지 권한 설정 삽입
INSERT INTO site_settings (key, value)
VALUES (
  'page_permissions',
  '{
    "pages": {
      "/": {"public": true, "requireAuth": false, "requireAdmin": false},
      "/analysis": {"public": true, "requireAuth": false, "requireAdmin": false},
      "/ai-analysis": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/calculator": {"public": true, "requireAuth": false, "requireAdmin": false},
      "/comparison": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/bookmarks": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/docs": {"public": true, "requireAuth": false, "requireAdmin": false},
      "/community": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/community/forum": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/community/events": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/settings": {"public": false, "requireAuth": true, "requireAdmin": false},
      "/contact": {"public": true, "requireAuth": false, "requireAdmin": false},
      "/admin": {"public": false, "requireAuth": true, "requireAdmin": true}
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- 6. 확인
SELECT * FROM site_settings;
