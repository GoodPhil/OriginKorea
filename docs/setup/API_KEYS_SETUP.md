# Origin Korea API 키 설정 가이드

이 가이드는 Origin Korea 사이트의 모든 기능을 활성화하기 위해 필요한 API 키 설정 방법을 설명합니다.

## 📊 Google Analytics 설정

### 1. Google Analytics 계정 생성

1. [Google Analytics](https://analytics.google.com/) 접속
2. **관리** (좌측 하단 톱니바퀴) 클릭
3. **속성 만들기** 클릭
4. 속성 이름: `Origin Korea`
5. 보고 시간대: 한국
6. 통화: KRW 또는 USD
7. **웹** 스트림 선택
8. 웹사이트 URL: `https://originkorea.kr`
9. **스트림 만들기** 클릭

### 2. 측정 ID 복사

- 생성 후 **측정 ID** (G-XXXXXXXXXX 형식) 복사

### 3. Vercel에 환경변수 추가

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 새 변수 추가:
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX` (복사한 측정 ID)
   - Environment: Production, Preview, Development 모두 체크
4. **Save** 클릭
5. **Deployments** 탭에서 **Redeploy** 실행

---

## 🐋 Polygonscan API 설정 (고래 추적 실제 데이터)

### 1. Polygonscan API 키 발급

1. [Polygonscan](https://polygonscan.com/) 접속
2. 우측 상단 **Sign In** 또는 **Register** (계정 생성)
3. 로그인 후 **API Keys** 메뉴 클릭
4. **Add** 버튼 클릭
5. App Name: `Origin Korea`
6. **Create New API Key** 클릭
7. 생성된 API Key 복사

### 2. Vercel에 환경변수 추가

1. Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**
2. 새 변수 추가:
   - Name: `POLYGONSCAN_API_KEY`
   - Value: (복사한 API 키)
3. **Save** 후 **Redeploy**

### API 사용량 제한

- 무료: 5 calls/second, 100,000 calls/day
- 충분한 사용량입니다

---

## 💾 Supabase 설정 (메뉴/공지사항 영구 저장)

### 이미 설정된 경우

Supabase가 이미 연결되어 있다면, SQL 스크립트만 실행하면 됩니다.

### SQL 스크립트 실행 방법

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New Query** 클릭

#### 메뉴 테이블 생성

```sql
-- 아래 내용을 복사하여 SQL Editor에 붙여넣기 후 Run 클릭
-- 프로젝트 루트의 MENU_SETUP.sql 파일 내용 전체
```

#### 공지사항 테이블 생성

```sql
-- 아래 내용을 복사하여 SQL Editor에 붙여넣기 후 Run 클릭
-- 프로젝트 루트의 ANNOUNCEMENTS_SETUP.sql 파일 내용 전체
```

### 필요한 환경변수 (이미 설정되어 있어야 함)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (선택, 관리자 기능용)

---

## 🔐 기타 선택적 API 키

### The Graph API (심층 유동성 데이터)

1. [The Graph](https://thegraph.com/studio/) 접속
2. API 키 생성
3. 환경변수: `THE_GRAPH_API_KEY`

### Web3Forms (문의 양식)

1. [Web3Forms](https://web3forms.com/) 접속
2. Access Key 발급
3. 환경변수: `NEXT_PUBLIC_WEB3FORMS_KEY`

---

## 📋 환경변수 요약표

| 변수명 | 용도 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | ❌ |
| `POLYGONSCAN_API_KEY` | 고래 추적 실제 데이터 | ❌ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 연결 | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 인증 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리자 기능 | ❌ |
| `THE_GRAPH_API_KEY` | 심층 유동성 | ❌ |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | 문의 양식 | ❌ |

---

## 🚀 설정 완료 후

1. Vercel에서 **Redeploy** 실행
2. 사이트 접속하여 기능 확인
3. Google Analytics: 실시간 보고서에서 방문자 확인
4. 추적 페이지: "Polygonscan API" 배지 확인

문제가 있으면 Vercel 로그 또는 브라우저 콘솔을 확인하세요.
