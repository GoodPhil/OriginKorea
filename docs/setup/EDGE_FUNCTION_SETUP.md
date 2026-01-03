# Supabase Edge Function 설정 가이드

## 관리자 이메일 알림 기능

회원가입 신청 시 관리자에게 이메일 알림을 자동으로 전송합니다.

## 사전 준비

### 1. Resend 계정 생성 (무료)
1. [Resend](https://resend.com) 에 가입
2. Dashboard에서 API Key 생성
3. 도메인 인증 (선택사항, 커스텀 발신자 주소 사용 시 필요)

### 2. Supabase CLI 설치
```bash
npm install -g supabase
```

## Edge Function 배포

### 1. Supabase 프로젝트 연결
```bash
cd originkorea
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

프로젝트 Reference는 Supabase Dashboard URL에서 확인:
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 2. 환경변수 설정
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 3. Edge Function 배포
```bash
supabase functions deploy send-registration-notification
```

### 4. 배포 확인
```bash
supabase functions list
```

## 테스트

### cURL로 테스트
```bash
curl -i --request POST \
  --url 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-registration-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "adminEmail": "admin@example.com",
    "applicant": {
      "email": "test@example.com",
      "display_name": "테스트유저",
      "reason": "테스트 가입 신청입니다."
    },
    "timestamp": "2026-01-01T12:00:00Z"
  }'
```

## 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `RESEND_API_KEY` | Resend API 키 | ✅ |
| `ADMIN_EMAIL` | 관리자 이메일 (코드에서 설정) | - |

## 이메일 발신자 설정

기본값: `Origin Korea <noreply@originkorea.kr>`

커스텀 도메인을 사용하려면:
1. Resend에서 도메인 인증
2. Edge Function 코드의 `FROM_EMAIL` 수정

## 대안: Supabase 없이 사용

Edge Function을 사용하지 않고도 이메일 알림을 받을 수 있습니다:

### 방법 1: admin_notifications 테이블 확인
- Supabase Dashboard에서 `admin_notifications` 테이블 확인
- 새 신청이 있으면 `is_read: false`인 레코드가 생성됨

### 방법 2: 외부 서비스 연동
- Zapier, Make(Integromat) 등을 사용하여 Supabase 테이블 변경 감지
- Webhook으로 이메일 서비스 트리거

## 트러블슈팅

### "Email service not configured" 에러
→ `RESEND_API_KEY` 환경변수가 설정되지 않음
```bash
supabase secrets set RESEND_API_KEY=your_key
```

### CORS 에러
→ Edge Function의 CORS 헤더 확인
→ Supabase Dashboard에서 함수 로그 확인

### 이메일이 도착하지 않음
1. Resend Dashboard에서 전송 로그 확인
2. 스팸 폴더 확인
3. 수신자 이메일 주소 확인

## 비용

- **Supabase Edge Functions**: 무료 티어 포함 (월 500,000 호출)
- **Resend**: 무료 티어 (월 3,000 이메일)

---

*Last updated: 2026.01.01*
