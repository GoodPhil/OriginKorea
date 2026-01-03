# Origin Korea 인증 및 권한 설정 가이드

## 1. Supabase Google 로그인 활성화

### 1.1 Supabase Dashboard 설정

1. **Supabase Dashboard** 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. **Authentication** → **Providers** 클릭
4. **Google** 찾기 → **Enable** 클릭

### 1.2 Google Cloud Console 설정

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **OAuth consent screen** 설정
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs에 추가:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. **Client ID**와 **Client Secret** 복사

### 1.3 Supabase에 Google 자격 증명 추가

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. **Client ID** 붙여넣기
3. **Client Secret** 붙여넣기
4. **Save** 클릭

---

## 2. 관리자 권한 설정

### 2.1 SQL로 관리자 권한 부여

Supabase **SQL Editor**에서 다음 쿼리 실행:

```sql
-- 1. 먼저 사용자의 이메일 확인
SELECT id, email, role, is_admin FROM profiles;

-- 2. 특정 이메일에 관리자 권한 부여
UPDATE profiles
SET role = 'admin', is_admin = true
WHERE email = 'your-email@example.com';

-- 3. 결과 확인
SELECT id, email, role, is_admin FROM profiles WHERE email = 'your-email@example.com';
```

### 2.2 profiles 테이블에 is_admin 컬럼이 없는 경우

```sql
-- is_admin 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 관리자 권한 부여
UPDATE profiles
SET is_admin = true, role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 3. 포럼 SQL 스키마 실행

### 3.1 FORUM_SETUP_FIXED.sql 실행

Supabase **SQL Editor**에서 `FORUM_SETUP_FIXED.sql` 파일 내용을 복사하여 실행:

```sql
-- =====================================================
-- ORIGIN KOREA FORUM SETUP (FIXED VERSION)
-- =====================================================

-- 1. 프로필 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  is_admin BOOLEAN DEFAULT false,
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

-- 5. 기본 카테고리 추가
INSERT INTO public.forum_categories (slug, name_ko, name_en, icon, sort_order) VALUES
  ('general', '일반 토론', 'General Discussion', 'MessageCircle', 1),
  ('announcements', '공지사항', 'Announcements', 'Megaphone', 2),
  ('staking', '스테이킹', 'Staking', 'Coins', 3),
  ('trading', '트레이딩', 'Trading', 'TrendingUp', 4),
  ('development', '개발', 'Development', 'Code', 5),
  ('help', '도움말', 'Help & Support', 'HelpCircle', 6)
ON CONFLICT (slug) DO NOTHING;

-- 6. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 생성
DO $$ BEGIN
  CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read categories" ON public.forum_categories FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read posts" ON public.forum_posts FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read comments" ON public.forum_comments FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. 프로필 자동 생성 트리거
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Vercel 환경 변수 설정

### 4.1 필수 환경 변수

| 변수 이름 | 설명 | 위치 |
|----------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API |
| `MORALIS_API_KEY` | 실시간 홀더 데이터 | https://admin.moralis.com/api-keys |

### 4.2 Vercel에서 설정

1. **Vercel Dashboard** 접속: https://vercel.com
2. **OriginKorea** 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 각 변수 추가 후 **Save**
5. **Deployments** → 최신 배포 → **Redeploy**

---

## 5. 문제 해결

### Google 로그인 오류
```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```
→ Supabase → Authentication → Providers → Google 활성화 필요

### 관리자 페이지 접근 불가
→ profiles 테이블에서 `is_admin = true` 설정 필요

### 포럼 게시글이 안 보임
→ FORUM_SETUP_FIXED.sql 실행 필요

### 로그인 후에도 "로그인 필요" 표시
→ RLS 정책이 올바르게 설정되었는지 확인

---

## 6. 설정 확인 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] FORUM_SETUP_FIXED.sql 실행 완료
- [ ] Google OAuth 활성화 완료
- [ ] 관리자 권한 부여 완료
- [ ] Vercel 환경 변수 설정 완료
- [ ] Vercel 재배포 완료

---

**문의**: support@same.new
