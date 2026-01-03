# 관리자 설정 가이드

## 1. Supabase API 키 확인

Supabase 대시보드에서 올바른 API 키를 가져오세요:

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **API** 클릭
4. 다음 값을 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (긴 JWT 토큰)

5. `.env.local` 파일 업데이트:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

## 2. 데이터베이스 테이블 생성

Supabase Dashboard → **SQL Editor**에서 `SUPABASE_SETUP.sql` 파일의 내용을 실행하세요.

## 3. 관리자 권한 부여

회원가입 후, Supabase Dashboard → **SQL Editor**에서 다음 SQL을 실행:

```sql
-- 자신의 이메일로 변경하세요
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

또는 **Table Editor** → **profiles** 테이블에서:
1. 해당 사용자 행 찾기
2. `is_admin` 컬럼을 `true`로 변경
3. 저장

## 4. 로그인 테스트

1. `/auth/login` 페이지에서 로그인
2. 로그인 성공 후 `/admin` 페이지 접근 가능 확인

## 5. 문제 해결

### "Supabase not configured" 메시지가 나오는 경우:
- `.env.local` 파일의 환경 변수 확인
- 개발 서버 재시작: `bun run dev`

### 로그인은 되지만 관리자 접근이 안 되는 경우:
- profiles 테이블에서 `is_admin` 값이 `true`인지 확인
- 브라우저 새로고침 또는 로그아웃 후 다시 로그인

### 프로필이 생성되지 않는 경우:
- `handle_new_user` 트리거가 생성되었는지 확인
- 수동으로 프로필 생성:
```sql
INSERT INTO public.profiles (id, email, display_name, is_admin)
VALUES (
  'user-uuid-from-auth-users',
  'your-email@example.com',
  'Your Name',
  TRUE
);
```

## 6. 현재 사용자 확인

```sql
-- 모든 프로필 조회
SELECT id, email, display_name, is_admin FROM public.profiles;

-- auth.users 테이블 조회
SELECT id, email FROM auth.users;
```
