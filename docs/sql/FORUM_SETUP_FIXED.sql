-- =====================================================
-- ORIGIN KOREA FORUM SETUP (FIXED VERSION)
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- 1. 프로필 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 포럼 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ko TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'MessageCircle',
  color TEXT DEFAULT 'blue',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2-1. sort_order 컬럼이 없으면 추가 (이미 테이블이 존재하는 경우)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'forum_categories'
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.forum_categories ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. 포럼 게시글 테이블
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 포럼 댓글 테이블
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 기본 카테고리 추가 (중복 방지)
INSERT INTO public.forum_categories (slug, name_ko, name_en, icon, sort_order) VALUES
  ('general', '일반 토론', 'General Discussion', 'MessageCircle', 1),
  ('announcements', '공지사항', 'Announcements', 'Megaphone', 2),
  ('staking', '스테이킹', 'Staking', 'Coins', 3),
  ('trading', '트레이딩', 'Trading', 'TrendingUp', 4),
  ('development', '개발', 'Development', 'Code', 5),
  ('help', '도움말', 'Help & Support', 'HelpCircle', 6)
ON CONFLICT (slug) DO NOTHING;

-- 6. RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 생성 (기존 정책이 있으면 건너뜀)

-- 프로필 읽기 (모든 사용자)
DO $$ BEGIN
  CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 프로필 수정 (본인만)
DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 카테고리 읽기
DO $$ BEGIN
  CREATE POLICY "Anyone can read categories" ON public.forum_categories FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 게시글 읽기
DO $$ BEGIN
  CREATE POLICY "Anyone can read posts" ON public.forum_posts FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 게시글 작성
DO $$ BEGIN
  CREATE POLICY "Users can insert posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 게시글 수정 (본인만)
DO $$ BEGIN
  CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 댓글 읽기
DO $$ BEGIN
  CREATE POLICY "Anyone can read comments" ON public.forum_comments FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 댓글 작성
DO $$ BEGIN
  CREATE POLICY "Users can insert comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 댓글 수정 (본인만)
DO $$ BEGIN
  CREATE POLICY "Users can update own comments" ON public.forum_comments FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 8. 프로필 자동 생성 트리거 (회원가입 시)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하면 교체)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 완료! 이제 포럼 기능을 사용할 수 있습니다.
-- =====================================================
