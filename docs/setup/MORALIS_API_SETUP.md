# Moralis API 설정 가이드 / Moralis API Setup Guide

## 한국어

### 1. Moralis 계정 생성

1. [Moralis.io](https://moralis.io) 접속
2. "Start for Free" 클릭하여 회원가입
3. 이메일 인증 완료

### 2. API 키 발급

1. 로그인 후 대시보드 접속
2. 좌측 메뉴에서 "Web3 APIs" 선택
3. "API Keys" 탭 클릭
4. "Your API Key" 섹션에서 키 복사

### 3. Vercel 환경 변수 설정

1. [Vercel Dashboard](https://vercel.com) 접속
2. Origin Korea 프로젝트 선택
3. Settings → Environment Variables
4. 새 변수 추가:
   - **Name**: `MORALIS_API_KEY`
   - **Value**: (복사한 API 키 붙여넣기)
   - **Environment**: Production, Preview, Development 모두 선택
5. "Save" 클릭

### 4. 재배포

1. Deployments 탭으로 이동
2. 최근 배포 우측 "..." 클릭
3. "Redeploy" 선택
4. "Redeploy" 버튼 클릭

### 5. 확인

재배포 후 Analysis 페이지에서:
- **HOLDERS** 섹션의 "Est." 표시가 사라짐
- 실제 홀더 수가 표시됨
- 상위 홀더 목록 표시 (선택 사항)

### 무료 플랜 제한

| 항목 | 제한 |
|------|------|
| 월간 API 호출 | 25,000회 |
| 초당 요청 | 5회 |
| 지원 체인 | Polygon, Ethereum, BSC 등 |

---

## English

### 1. Create Moralis Account

1. Visit [Moralis.io](https://moralis.io)
2. Click "Start for Free" to sign up
3. Complete email verification

### 2. Get API Key

1. Log in and access dashboard
2. Select "Web3 APIs" from left menu
3. Click "API Keys" tab
4. Copy key from "Your API Key" section

### 3. Set Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select Origin Korea project
3. Settings → Environment Variables
4. Add new variable:
   - **Name**: `MORALIS_API_KEY`
   - **Value**: (paste your API key)
   - **Environment**: Select Production, Preview, Development
5. Click "Save"

### 4. Redeploy

1. Go to Deployments tab
2. Click "..." on recent deployment
3. Select "Redeploy"
4. Click "Redeploy" button

### 5. Verify

After redeployment, on Analysis page:
- "Est." label disappears from HOLDERS section
- Actual holder count is displayed
- Top holders list shown (optional)

### Free Plan Limits

| Item | Limit |
|------|-------|
| Monthly API Calls | 25,000 |
| Requests per Second | 5 |
| Supported Chains | Polygon, Ethereum, BSC, etc. |

---

## API 사용 예시 / API Usage Example

```typescript
// Moralis API call for token holders
const response = await fetch(
  `https://deep-index.moralis.io/api/v2.2/erc20/${TOKEN_ADDRESS}/owners?chain=polygon&order=DESC`,
  {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': MORALIS_API_KEY,
    },
  }
);
```

---

**Last Updated**: 2025-12-31
