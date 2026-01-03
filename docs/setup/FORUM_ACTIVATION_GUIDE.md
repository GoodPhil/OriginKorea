# 포럼 활성화 가이드

이 가이드는 Origin Korea 커뮤니티 포럼을 활성화하는 방법을 설명합니다.

## 1단계: Supabase 프로젝트 생성 (이미 있으면 건너뛰기)

1. [Supabase](https://supabase.com/) 접속 후 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: `origin-korea`)
4. 데이터베이스 비밀번호 설정 (안전하게 보관)
5. 지역 선택 (예: Northeast Asia - Tokyo)
6. "Create new project" 클릭

## 2단계: 포럼 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `FORUM_SETUP.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭
5. "Success. No rows returned" 메시지 확인

### 확인 방법
- **Table Editor**에서 다음 테이블이 생성되었는지 확인:
  - `forum_categories` (6개 기본 카테고리 포함)
  - `forum_posts`
  - `forum_comments`
  - `forum_likes`
  - `forum_bookmarks`

## 3단계: API 키 확인

1. Supabase 대시보드에서 **Settings** → **API** 클릭
2. 다음 값을 복사:

| 항목 | 설명 |
|------|------|
| **Project URL** | `https://xxxxx.supabase.co` |
| **anon public** | 공개 API 키 (NEXT_PUBLIC_SUPABASE_ANON_KEY) |
| **service_role** | 서비스 역할 키 (SUPABASE_SERVICE_ROLE_KEY) - 비밀 유지! |

## 4단계: Vercel 환경 변수 설정

1. [Vercel](https://vercel.com/) 로그인
2. Origin Korea 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 다음 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. **Save** 클릭
6. **Deployments** → **Redeploy** 클릭

## 5단계: 인증 설정 (선택사항)

Supabase 인증을 사용하려면:

1. Supabase 대시보드에서 **Authentication** → **Providers** 클릭
2. **Email** 활성화
3. **Site URL** 설정: `https://originkorea.vercel.app`
4. **Redirect URLs** 추가:
   - `https://originkorea.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (개발용)

## 6단계: 테스트

1. https://originkorea.vercel.app/community/forum 접속
2. 회원가입/로그인
3. 새 글 작성 테스트
4. 댓글 작성 테스트

## 문제 해결

### "Forum is not configured" 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Vercel 재배포 완료 여부 확인

### 게시글 작성 실패
- 로그인 상태인지 확인
- `forum_posts` 테이블 RLS 정책 확인

### 카테고리가 보이지 않음
- `forum_categories` 테이블에 데이터가 있는지 확인
- SQL 실행 시 오류가 없었는지 확인

---

**필요한 환경 변수 요약:**

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 선택사항
MORALIS_API_KEY=your_moralis_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

---

**마지막 업데이트**: 2025-12-30
