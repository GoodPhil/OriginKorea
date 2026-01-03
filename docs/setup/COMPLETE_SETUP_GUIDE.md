# Origin Korea 완전 설정 가이드

이 가이드는 Origin Korea 프로젝트의 모든 기능을 활성화하기 위한 단계별 설정 방법을 설명합니다.

## 1단계: Supabase 설정 (인증 + 포럼)

### 1.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성/로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: origin-korea
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: Northeast Asia (Tokyo) 권장
4. 프로젝트 생성 완료 대기 (약 2분)

### 1.2 환경 변수 복사

1. Supabase 대시보드 → Settings → API
2. 다음 값을 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)

### 1.3 포럼 테이블 생성

1. Supabase 대시보드 → SQL Editor
2. 프로젝트의 `FORUM_SETUP.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기 후 "Run" 클릭
4. 성공 메시지 확인

**FORUM_SETUP.sql 주요 내용:**
- `forum_categories` - 포럼 카테고리
- `forum_posts` - 게시글
- `forum_comments` - 댓글
- `forum_likes` - 좋아요
- `forum_bookmarks` - 북마크
- RLS 정책 및 트리거

---

## 2단계: Moralis API 설정 (실시간 Holders 데이터)

### 2.1 Moralis 계정 생성

1. [Moralis](https://moralis.io)에 접속
2. 회원가입 (무료 플랜 사용 가능)
3. API Keys 메뉴로 이동

### 2.2 API 키 복사

1. "Web3 API Key" 섹션에서 API 키 복사
2. 이 키를 `MORALIS_API_KEY` 환경 변수로 사용

### 2.3 무료 플랜 제한

- 월 25,000 API 호출
- 초당 5회 요청 제한
- Production용으로는 Pro 플랜 권장

---

## 3단계: Vercel 환경 변수 설정

### 3.1 Vercel 대시보드 접속

1. [Vercel](https://vercel.com)에 로그인
2. Origin Korea 프로젝트 선택
3. Settings → Environment Variables

### 3.2 환경 변수 추가

다음 환경 변수를 모두 추가하세요:

| 변수 이름 | 값 | 용도 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxxx.supabase.co | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJxxxx... | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJxxxx... | Supabase 서버 키 |
| `MORALIS_API_KEY` | xxxx | Moralis API 키 |
| `THE_GRAPH_API_KEY` | xxxx | The Graph API 키 (선택) |
| `POLYGONSCAN_API_KEY` | xxxx | PolygonScan API 키 (선택) |

### 3.3 환경 설정

각 변수에 대해:
1. "Add" 클릭
2. Key와 Value 입력
3. Environment 선택: Production, Preview, Development 모두 체크
4. "Save" 클릭

---

## 4단계: 재배포

### 4.1 Vercel에서 재배포

1. Vercel 대시보드 → Deployments
2. 최근 배포 우측의 "..." 메뉴 클릭
3. "Redeploy" 선택
4. "Use existing Build Cache" 체크 해제 (권장)
5. "Redeploy" 클릭

### 4.2 배포 확인

배포 완료 후:
1. 사이트 접속
2. 로그인/회원가입 테스트
3. 포럼 페이지 (/community/forum) 확인
4. Analysis 페이지에서 Holders 데이터 확인

---

## 5단계: 테스트

### 5.1 인증 테스트

1. 회원가입 (/auth/signup)
2. 이메일 확인 (Supabase 설정에 따라)
3. 로그인 (/auth/login)
4. 로그아웃

### 5.2 포럼 테스트

1. 포럼 메인 (/community/forum)
2. 카테고리 목록 확인
3. 새 글 작성 (로그인 필요)
4. 댓글 작성

### 5.3 Analysis 테스트

1. Analysis 페이지 (/analysis)
2. Holders 데이터가 "Est." 대신 실제 수치 표시 확인
3. 대규모 거래 추적 기능 확인

---

## 문제 해결

### 로그인/로그아웃이 안 됨

1. 브라우저 캐시/쿠키 삭제
2. Supabase 환경 변수 확인
3. Supabase 대시보드에서 Auth → Users 확인

### 포럼이 작동하지 않음

1. FORUM_SETUP.sql이 실행되었는지 확인
2. Supabase Table Editor에서 forum_categories 테이블 존재 확인
3. RLS 정책이 올바르게 설정되었는지 확인

### Holders 데이터가 표시되지 않음

1. MORALIS_API_KEY 환경 변수 확인
2. Moralis 대시보드에서 API 호출 제한 확인
3. 서버 로그에서 오류 확인

---

## 환경 변수 체크리스트

```bash
# 필수 (인증/포럼)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 권장 (실시간 데이터)
MORALIS_API_KEY=

# 선택 (추가 데이터 소스)
THE_GRAPH_API_KEY=
POLYGONSCAN_API_KEY=
```

---

## 관련 문서

- [FORUM_SETUP.sql](./FORUM_SETUP.sql) - 포럼 테이블 스키마
- [FORUM_ACTIVATION_GUIDE.md](./FORUM_ACTIVATION_GUIDE.md) - 포럼 활성화 상세 가이드
- [MORALIS_API_SETUP.md](./MORALIS_API_SETUP.md) - Moralis API 상세 설정
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 상세 설정

---

**Last Updated**: 2025-12-31
**Version**: v171
