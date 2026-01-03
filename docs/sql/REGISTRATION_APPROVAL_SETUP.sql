-- =====================================================
-- 관리자 승인 회원가입 시스템 설정
-- Registration Approval System Setup
-- =====================================================
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- =====================================================

-- 1. 가입 신청 테이블 생성
-- Create registration requests table
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  phone TEXT,
  reason TEXT NOT NULL,  -- 가입 사유 / Reason for joining
  referral_source TEXT,  -- 어떻게 알게 되었는지 / How did you find us
  additional_info TEXT,  -- 추가 정보 / Additional information
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,      -- 관리자 메모
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);

-- 3. RLS 정책 설정
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- 누구나 가입 신청 가능 (INSERT)
CREATE POLICY "Anyone can submit registration request"
  ON registration_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 본인 신청 조회 가능
CREATE POLICY "Users can view own registration request"
  ON registration_requests
  FOR SELECT
  TO anon, authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- 관리자는 모든 신청 조회 가능
CREATE POLICY "Admins can view all registration requests"
  ON registration_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 관리자는 신청 업데이트 가능
CREATE POLICY "Admins can update registration requests"
  ON registration_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 4. 업데이트 트리거
CREATE OR REPLACE FUNCTION update_registration_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_registration_requests_updated_at ON registration_requests;
CREATE TRIGGER trigger_update_registration_requests_updated_at
  BEFORE UPDATE ON registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_registration_requests_updated_at();

-- 5. 가입 신청 통계 함수
CREATE OR REPLACE FUNCTION get_registration_stats()
RETURNS TABLE (
  total_count BIGINT,
  pending_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_count,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_count
  FROM registration_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 권한 설정
GRANT EXECUTE ON FUNCTION get_registration_stats() TO authenticated;

-- =====================================================
-- 설정 완료!
-- =====================================================
