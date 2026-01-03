# Origin Korea - DeFi Platform

Origin Korea는 알고리즘 통화 LGNS를 기반으로 한 탈중앙화 금융 플랫폼입니다.

**Live Demo**: https://originkorea.vercel.app

## ✨ 주요 기능

### 🎨 다크/라이트 모드 (NEW!)
- ✅ 시스템 테마 자동 감지
- ✅ 수동 테마 전환
- ✅ 차트 색상 테마별 최적화
- ✅ LocalStorage 설정 저장

### 📧 Contact 폼 이메일 전송 (NEW!)
- ✅ Web3Forms API 연동
- ✅ 실시간 폼 전송
- ✅ 로딩 상태 표시
- ✅ 에러 처리 및 대체 방법 제공

### 💱 실시간 환율 (NEW!)
- ✅ USD/KRW 실시간 환율 API
- ✅ 한국어 모드에서 원화 표시
- ✅ 한국 숫자 단위 (조, 억, 만)
- ✅ 1시간 캐시로 API 호출 최소화

### 📊 DeFi 기능
- ✅ 실시간 LGNS/DAI 토큰 데이터 (DexScreener API)
- ✅ 고급 복리 스테이킹 계산기 (8시간 복리)
- ✅ 1일/7일/30일 가격 차트
- ✅ 토큰 정보 및 통계

### 🔐 인증 시스템
- ✅ 이메일/비밀번호 회원가입 및 로그인
- ✅ 관리자 권한 관리 시스템
- ✅ Supabase 기반 안전한 인증

### 🔖 북마크 시스템
- ✅ 60+ 큐레이션된 Origin 관련 링크
- ✅ 10개 카테고리로 분류
- ✅ 실시간 검색 및 필터링

### 🌍 다국어 지원
- ✅ 한국어/영어 완벽 지원
- ✅ 브라우저 언어 자동 감지
- ✅ KO/EN 버튼 전환

## 🚀 빠른 시작

### 1. 패키지 설치

```bash
bun install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```bash
# Supabase (선택 - 인증 기능용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Web3Forms (선택 - Contact 폼용)
NEXT_PUBLIC_WEB3FORMS_KEY=your_web3forms_access_key
```

### 3. 개발 서버 실행

```bash
bun run dev
```

## 📧 Contact 폼 설정 (Web3Forms)

1. https://web3forms.com/ 방문
2. 이메일 입력: `goodphil@gmail.com`
3. "Create Access Key" 클릭
4. 받은 Access Key를 환경 변수에 추가

## 🏗️ 기술 스택

- **Framework**: Next.js 16.1.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui
- **Auth**: Supabase
- **Charts**: Recharts
- **Email**: Web3Forms
- **API**: DexScreener

## 👨‍💻 관리자

**PHIL** - goodphil@gmail.com

## 📄 라이선스

MIT License

---

**Made with ❤️ by PHIL | Powered by Same.new**
