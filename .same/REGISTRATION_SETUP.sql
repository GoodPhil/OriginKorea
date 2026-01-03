-- ============================================
-- REGISTRATION_SETUP.sql
-- Origin Korea - 회원가입 신청 테이블 설정
-- ============================================
-- Supabase SQL Editor에서 이 스크립트를 실행하세요.
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================

-- 1. registration_requests 테이블 생성
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  reason TEXT NOT NULL,
  referral_source VARCHAR(255),
  additional_info TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 설정
-- 관리자만 모든 데이터 접근 가능
CREATE POLICY "Admins can view all registrations" ON registration_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update registrations" ON registration_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 누구나 새 신청 삽입 가능 (로그인 불필요)
CREATE POLICY "Anyone can insert registration" ON registration_requests
  FOR INSERT WITH CHECK (true);

-- 5. admin_notifications 테이블 (선택사항 - 알림 저장용)
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  admin_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);

-- 6. registrations 뷰 (호환성 - 기존 코드에서 사용할 수 있음)
CREATE OR REPLACE VIEW registrations AS
SELECT * FROM registration_requests;

-- ============================================
-- 선택사항: 테스트 데이터 삽입
-- ============================================
-- INSERT INTO registration_requests (email, display_name, reason, status)
-- VALUES ('test@example.com', 'TestUser', 'Testing registration', 'pending');

-- ============================================
-- 확인: 테이블이 생성되었는지 확인
-- ============================================
-- SELECT * FROM registration_requests LIMIT 5;
