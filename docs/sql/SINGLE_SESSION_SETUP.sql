-- =====================================================
-- 중복 로그인 방지를 위한 단일 세션 설정
-- Single Session Enforcement Setup
-- =====================================================
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- =====================================================

-- 1. profiles 테이블에 현재 세션 ID 컬럼 추가
-- Add current session ID column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_session_id TEXT;

-- 2. 세션 업데이트 시간 컬럼 추가
-- Add session update timestamp column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS session_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 세션 업데이트 함수 생성
-- Create function to update session
CREATE OR REPLACE FUNCTION update_user_session(
  p_user_id UUID,
  p_session_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET
    current_session_id = p_session_id,
    session_updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 세션 검증 함수 생성
-- Create function to validate session
CREATE OR REPLACE FUNCTION validate_user_session(
  p_user_id UUID,
  p_session_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stored_session_id TEXT;
BEGIN
  SELECT current_session_id INTO v_stored_session_id
  FROM profiles
  WHERE id = p_user_id;

  -- 저장된 세션이 없으면 유효 (첫 로그인)
  IF v_stored_session_id IS NULL THEN
    RETURN TRUE;
  END IF;

  -- 세션 ID 일치 여부 반환
  RETURN v_stored_session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 세션 무효화 함수 생성 (로그아웃용)
-- Create function to invalidate session
CREATE OR REPLACE FUNCTION invalidate_user_session(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET
    current_session_id = NULL,
    session_updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC 권한 설정
-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_session(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_user_session(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION invalidate_user_session(UUID) TO authenticated;

-- =====================================================
-- 설정 완료!
-- 이제 AuthContext.tsx가 이 함수들을 사용하여
-- 중복 로그인을 방지합니다.
-- =====================================================
