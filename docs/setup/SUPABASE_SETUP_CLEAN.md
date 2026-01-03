# 🔄 Supabase 데이터베이스 재설정 (Clean Setup)

## ⚠️ 이 스크립트는 기존 테이블을 삭제하고 새로 만듭니다!

아래 SQL을 Supabase SQL Editor에서 실행하세요:

```sql
-- ============================================
-- 1. 기존 테이블 및 함수 삭제 (Clean up)
-- ============================================

-- RLS 정책 삭제
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Bookmarks are viewable by everyone" ON bookmarks;
DROP POLICY IF EXISTS "Only admins can insert bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Only admins can update bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Only admins can delete bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Page permissions are viewable by everyone" ON page_permissions;
DROP POLICY IF EXISTS "Only admins can manage page permissions" ON page_permissions;

-- 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 테이블 삭제 (순서 중요: 외래 키 때문에)
DROP TABLE IF EXISTS page_permissions CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 2. 테이블 생성
-- ============================================

-- Profiles 테이블 (사용자 프로필 및 관리자 권한)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks 테이블 (북마크 관리)
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Permissions 테이블 (페이지 접근 권한)
CREATE TABLE page_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 트리거 및 함수 생성
-- ============================================

-- 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email = 'goodphil@gmail.com' THEN TRUE
      ELSE FALSE
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 회원가입 시 자동으로 프로필 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. 기본 데이터 입력
-- ============================================

-- 페이지 권한 기본 설정
INSERT INTO page_permissions (page_path, is_public) VALUES
  ('/', TRUE),
  ('/governance', FALSE),
  ('/community', FALSE),
  ('/docs', FALSE),
  ('/calculator', TRUE),
  ('/bookmarks', FALSE),
  ('/contact', TRUE),
  ('/auth/login', TRUE),
  ('/auth/signup', TRUE);

-- ============================================
-- 5. Row Level Security (RLS) 설정
-- ============================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS 정책
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Bookmarks RLS 정책
CREATE POLICY "Bookmarks are viewable by everyone" ON bookmarks
  FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can insert bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can update bookmarks" ON bookmarks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can delete bookmarks" ON bookmarks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Page Permissions RLS 정책
CREATE POLICY "Page permissions are viewable by everyone" ON page_permissions
  FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage page permissions" ON page_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- ============================================
-- 완료! Success!
-- ============================================
-- 이제 회원가입하고 goodphil@gmail.com으로 로그인하세요!
-- Now sign up and login with goodphil@gmail.com!
```

---

## ✅ 실행 완료 후:

1. **회원가입**: `/auth/signup`에서 `goodphil@gmail.com` 계정 생성
2. **이메일 확인**: Supabase가 보낸 확인 이메일 클릭
3. **로그인**: `/auth/login`에서 로그인
4. **관리자 확인**: 자동으로 관리자 권한이 부여됩니다!

---

## 🔍 확인 방법:

Supabase Dashboard → **Table Editor** → **profiles** 테이블:
- `goodphil@gmail.com`의 `is_admin` 값이 `TRUE`인지 확인

---

**이 스크립트는 기존 데이터를 모두 삭제하고 새로 시작합니다!**
