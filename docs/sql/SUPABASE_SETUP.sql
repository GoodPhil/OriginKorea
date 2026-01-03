-- =====================================================
-- Origin Korea Supabase 데이터베이스 설정
-- Supabase SQL Editor에서 이 스크립트를 실행하세요
-- =====================================================

-- 1. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  push_subscription JSONB,
  price_alert_enabled BOOLEAN DEFAULT FALSE,
  price_alert_threshold DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로필 테이블 RLS 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 프로필을 볼 수 있음" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필을 수정할 수 있음" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "관리자는 모든 프로필을 볼 수 있음" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 2. 북마크 테이블
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  url TEXT NOT NULL,
  order_num INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 북마크 테이블 RLS 정책
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 북마크를 볼 수 있음" ON public.bookmarks
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "관리자만 북마크를 생성할 수 있음" ON public.bookmarks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "관리자만 북마크를 수정할 수 있음" ON public.bookmarks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "관리자만 북마크를 삭제할 수 있음" ON public.bookmarks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 3. 페이지 권한 테이블
CREATE TABLE IF NOT EXISTS public.page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT UNIQUE NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ko TEXT,
  description_en TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  requires_auth BOOLEAN DEFAULT FALSE,
  requires_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 페이지 권한 RLS 정책
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 페이지 권한을 볼 수 있음" ON public.page_permissions
  FOR SELECT USING (TRUE);

CREATE POLICY "관리자만 페이지 권한을 수정할 수 있음" ON public.page_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 4. 공지사항 테이블
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ko TEXT,
  content_en TEXT,
  type TEXT DEFAULT 'info', -- info, warning, success, error
  is_push_sent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공지사항 RLS 정책
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 활성 공지사항을 볼 수 있음" ON public.announcements
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "관리자만 공지사항을 관리할 수 있음" ON public.announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 5. 가격 알림 기록 테이블
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  price_at_alert DECIMAL(10,4) NOT NULL,
  previous_price DECIMAL(10,4) NOT NULL,
  change_percent DECIMAL(5,2) NOT NULL,
  alert_type TEXT NOT NULL, -- 'up' or 'down'
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 가격 알림 RLS 정책
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 알림만 볼 수 있음" ON public.price_alerts
  FOR SELECT USING (user_id = auth.uid());

-- 6. 새 사용자 가입 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 기본 페이지 권한 데이터 삽입
INSERT INTO public.page_permissions (page_path, name_ko, name_en, description_ko, description_en, is_public, requires_auth, requires_admin)
VALUES
  ('/', '홈페이지', 'Home', '메인 대시보드 페이지', 'Main dashboard page', TRUE, FALSE, FALSE),
  ('/governance', '거버넌스', 'Governance', 'DAO 투표 및 제안', 'DAO voting and proposals', TRUE, FALSE, FALSE),
  ('/community', '커뮤니티', 'Community', '소셜 채널 및 이벤트', 'Social channels and events', TRUE, FALSE, FALSE),
  ('/docs', '문서', 'Documentation', '가이드 및 API 문서', 'Guides and API docs', TRUE, FALSE, FALSE),
  ('/calculator', '계산기', 'Calculator', '스테이킹 수익 계산기', 'Staking rewards calculator', TRUE, FALSE, FALSE),
  ('/bookmarks', '북마크', 'Bookmarks', '유용한 링크 모음', 'Useful links collection', TRUE, FALSE, FALSE),
  ('/contact', '문의', 'Contact', '문의 양식', 'Contact form', TRUE, FALSE, FALSE),
  ('/admin', '관리자', 'Admin', '관리자 전용 대시보드', 'Admin-only dashboard', FALSE, TRUE, TRUE)
ON CONFLICT (page_path) DO NOTHING;

-- 8. 첫 번째 관리자 설정 (이메일 변경 필요)
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'goodphil@gmail.com';

-- =====================================================
-- 설정 완료!
-- 이제 Supabase 프로젝트 URL과 anon key를
-- .env.local 파일에 추가하세요:
--
-- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- =====================================================
