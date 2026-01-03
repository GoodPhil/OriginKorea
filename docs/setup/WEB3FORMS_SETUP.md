# Web3Forms API 설정 가이드 / Web3Forms API Setup Guide

## 🇰🇷 한국어 가이드

### 1단계: Web3Forms 가입
1. [https://web3forms.com/](https://web3forms.com/) 방문
2. 이메일 입력 필드에 `goodphil@gmail.com` 입력
3. "Create your Access key" 버튼 클릭

### 2단계: 이메일 확인
1. 입력한 이메일 받은편지함 확인
2. Web3Forms에서 온 이메일 열기
3. 이메일에 포함된 **Access Key** 복사 (예: `12345678-abcd-1234-efgh-123456789012`)

### 3단계: Netlify 환경 변수 설정
1. [Netlify Dashboard](https://app.netlify.com/) 로그인
2. Origin Korea 프로젝트 선택
3. **Site settings** → **Environment variables** 이동
4. **Add a variable** 클릭
5. 다음 정보 입력:
   - **Key**: `NEXT_PUBLIC_WEB3FORMS_KEY`
   - **Value**: 복사한 Access Key
6. **Save** 클릭

### 4단계: 사이트 재배포
1. **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
3. 배포 완료 후 Contact 페이지에서 테스트

### 테스트 방법
1. https://same-qq5nqmpaydn-latest.netlify.app/contact 방문
2. 이름, 이메일, 제목, 메시지 입력
3. "문의 보내기" 클릭
4. 성공 메시지 확인
5. `goodphil@gmail.com` 받은편지함에서 메일 확인

---

## 🇺🇸 English Guide

### Step 1: Sign up for Web3Forms
1. Visit [https://web3forms.com/](https://web3forms.com/)
2. Enter `goodphil@gmail.com` in the email field
3. Click "Create your Access key" button

### Step 2: Check Email
1. Check the inbox of the email you entered
2. Open the email from Web3Forms
3. Copy the **Access Key** (e.g., `12345678-abcd-1234-efgh-123456789012`)

### Step 3: Set Netlify Environment Variable
1. Log in to [Netlify Dashboard](https://app.netlify.com/)
2. Select the Origin Korea project
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Enter the following:
   - **Key**: `NEXT_PUBLIC_WEB3FORMS_KEY`
   - **Value**: The Access Key you copied
6. Click **Save**

### Step 4: Redeploy the Site
1. Go to the **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Test the Contact page after deployment completes

### How to Test
1. Visit https://same-qq5nqmpaydn-latest.netlify.app/contact
2. Enter name, email, subject, and message
3. Click "Send Message"
4. Confirm the success message
5. Check `goodphil@gmail.com` inbox for the email

---

## ⚠️ 주의사항 / Notes

- Web3Forms는 무료로 월 250개 메일을 전송할 수 있습니다.
- API 키가 설정되지 않은 경우, mailto: 링크로 폴백됩니다.
- 스팸 방지를 위해 reCAPTCHA를 추가할 수 있습니다.

- Web3Forms allows 250 free emails per month.
- If the API key is not set, it falls back to mailto: link.
- You can add reCAPTCHA for spam protection.

---

## 📧 문제 해결 / Troubleshooting

### 메일이 오지 않는 경우 / If emails are not received:
1. 스팸 폴더 확인
2. Netlify 환경 변수 이름이 정확히 `NEXT_PUBLIC_WEB3FORMS_KEY`인지 확인
3. 재배포 후 캐시 삭제 (Ctrl+Shift+R)

### API 오류 발생 시 / If API error occurs:
1. Access Key가 올바른지 확인
2. 이메일 주소가 정확한지 확인
3. Web3Forms 대시보드에서 사용량 확인
