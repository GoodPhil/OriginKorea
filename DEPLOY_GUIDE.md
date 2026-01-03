# Origin Korea 배포 가이드
## Vercel 배포 (권장)
### 1단계: GitHub 저장소 생성
1. GitHub.com에서 새 저장소 생성
2. 저장소 이름: `originkorea` (또는 원하는 이름)
3. Public 또는 Private 선택
### 2단계: 코드 푸시
```bash
# 터미널에서 실행
cd originkorea
git remote add origin https://github.com/YOUR_USERNAME/originkorea.git
git branch -M main
git push -u origin main
```
### 3단계: Vercel 연결
1. https://vercel.com 접속 및 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프레임워크: **Next.js** (자동 감지됨)
### 4단계: 환경 변수 설정
Vercel 프로젝트 Settings > Environment Variables에 추가:
| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://niflxfxynismoqgvhtbt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
### 5단계: 배포
"Deploy" 버튼 클릭 → 자동 빌드 및 배포
---
## 배포 후 확인사항
- [ ] 메인 페이지 로딩 확인
- [ ] Supabase 연결 확인 (로그인 기능)
- [ ] API 라우트 작동 확인
---
## 문제 해결
### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
bun run build
```
### 환경 변수 문제
- Vercel에서 환경 변수가 `NEXT_PUBLIC_` 접두사 확인
- 재배포 필요 (환경 변수 변경 후)
---
## 커스텀 도메인 연결
1. Vercel Dashboard > Settings > Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 설정
