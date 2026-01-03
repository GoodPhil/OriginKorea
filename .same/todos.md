# OriginKorea 작업 목록

## 현재 상태 (버전 395)
- **Same 버전**: 395
- **GitHub 저장소**: https://github.com/GoodPhil/OriginKorea
- **프로덕션 URL**: https://originkorea.vercel.app
- **마지막 업데이트**: 2026.01.03

## 완료된 작업 (v395) ✅
- [x] 홈화면 AI 카드 LGNS 가격 크게 & 원화 표기 - CompactAISentiment 업데이트
- [x] 관리자 점검 모드 기존 기능 복구 (기간/문구 입력) - MaintenanceToggle 컴포넌트 사용
- [x] 초대 페이지 새해카드 GitHub 이미지로 변경 - raw.githubusercontent.com 사용
- [x] AI 시장 분석 페이지 개선 - LGNS 제거, AI Price Targets 및 Risk Assessment 추가
- [x] 메뉴 API 기본 데이터 업데이트 - membership 제거, staking 이름 변경
- [x] 홈화면 7일 추이 그래프에 "추세 기반 시뮬레이션" 라벨 추가
- [x] .env.example 파일 생성 - POLYGONSCAN_API_KEY 포함

## 대기 중인 작업 📋
- [ ] POLYGONSCAN_API_KEY 환경변수 설정 - 사용자가 Vercel에서 설정 필요
- [ ] 기술분석/온체인 분석 페이지 항목 재분류 - 추후 진행
- [ ] GitHub 푸시하여 Vercel 자동 배포

## 이전 완료된 작업
- [x] **리베이스 카운트다운** - 에포크 데이터 기반 다음 리베이스까지 시간 표시
- [x] **트레저리 백킹 비율** - 트레저리 잔액 및 시가총액 대비 백킹 비율
- [x] **본드 할인율** - Turbine 컨트랙트에서 본드 가격/할인 데이터 조회
- [x] **유동성 풀 정보** - QuickSwap LP에서 LGNS/USDC 리저브 및 가격 조회
- [x] **사용자 포트폴리오** - MetaMask 지갑 연결 및 잔액 표시
- [x] **계산기 600일 DAI 옵션 삭제** - 패키지에서 DAI 보상 옵션 제거
- [x] **예상 수익 USD/KRW 동시 표시** - 스테이킹 수량, 예상 보상, 총 수령액에 달러와 원화 표시
- [x] **기술 분석 페이지 성능 최적화** - 차트 컴포넌트 lazy loading 적용
- [x] **Skeleton 컴포넌트 추가** - 차트 로딩 플레이스홀더
- [x] **실제 컨트랙트 주소 설정** - LGNS Token, Staking, Treasury, Turbine, LP 주소 설정
- [x] **Web3 스마트 컨트랙트 연동** - ethers.js로 블록체인 데이터 조회
- [x] **staking-data API 생성** - 토큰 정보, 수익률, 에포크, 트레저리, 터빈, LP 조회
- [x] **StakingInfo 컴포넌트 생성** - 실시간 블록체인 데이터 표시
- [x] **계산기 페이지에 StakingInfo 통합**
- [x] **온체인 분석 페이지 섹션 순서 수정**
- [x] **투자 수익률 계산기 복원**
- [x] **12개 기술 지표 추가**
- [x] **다크/라이트 모드 스타일 일관성 확인**
- [x] **이미지 lazy loading 최적화**
- [x] **직접 MetaMask 연결 구현** - wagmi/viem HMR 오류 해결을 위해 직접 연결 방식으로 변경
- [x] **sLGNS 스테이킹 잔액 조회** - 사용자 스테이킹 잔액 표시
- [x] **TVL 히스토리 차트** - 30일 추이 차트 추가
- [x] **Web3Provider 간소화** - passthrough 컴포넌트로 변경
- [x] **지갑 연결 기능 제거** - WalletContext, Web3Provider 삭제
- [x] **멤버십 페이지 제거** - membership 페이지 및 관련 링크 삭제
- [x] **고래 지갑 추적 제거** - 온체인 분석에서 고래 지갑 섹션 삭제
- [x] **스테이킹 포트폴리오 제거** - StakingInfo에서 지갑 연결 및 포트폴리오 제거
- [x] **계산기 → 스테이킹 이름 변경** - 네비게이션, 푸터, 페이지 타이틀 업데이트
- [x] **whale-data API 컨트랙트 주소 수정** - 올바른 LGNS 주소로 변경
- [x] **PremiumFeatureGate 삭제** - 더 이상 사용되지 않음
- [x] **관리자 스테이킹 설정 페이지 생성** - /admin/staking 페이지 추가
- [x] **관리자 대시보드에 스테이킹 설정 링크 추가** - 메뉴에 새로운 스테이킹 설정 항목 추가
- [x] **staking-data API 수동 데이터 지원** - 관리자가 설정한 수동 데이터 사용 가능
- [x] **삭제된 메뉴 항목 필터링** - membership, wallet, portfolio 자동 필터링으로 localStorage 캐시 문제 해결

## 스마트 컨트랙트 주소 (Polygon)
- **LGNS Token**: `0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01`
- **Staking Contract**: `0x1964Ca90474b11FFD08af387b110ba6C96251Bfc`
- **Treasury**: `0x7B9B7d4F870A38e92c9a181B00f9b33cc8Ef5321`
- **Turbine**: `0x07Ff4e06865de4934409Aa6eCea503b08Cc1C78d`
- **QuickSwap LP**: `0x882df4b0fb50a229c3b4124eb18c759911485bfb`

## 관리자 스테이킹 설정 기능
1. **컨트랙트 주소 관리**: 컨트랙트 주소 추가/수정/삭제
2. **트레저리 수동 데이터**: 트레저리 잔액, USD 가치, 백킹 비율 수동 입력
3. **본드 수동 데이터**: 본드 가격, 할인율, 총 채무 수동 입력
4. **유동성 수동 데이터**: LGNS/USDC 리저브, 총 유동성 수동 입력
5. **수익률 수동 데이터**: 8시간/일/주/월 수익률 및 연간 APY 수동 입력

## StakingInfo 기능
1. **리베이스 카운트다운**: 에포크 데이터 기반 다음 리베이스까지 카운트다운
2. **토큰 정보**: 총 공급량, 현재 가격, 시가총액, 24시간 거래량
3. **스테이킹 통계**: TVL, 스테이킹 비율, 스테이킹 인덱스
4. **트레저리 정보**: 트레저리 잔액, 백킹 비율
5. **본드 정보**: 본드 할인율, 본드 가격, 총 채무
6. **유동성 풀**: 총 유동성, LGNS/USDC 리저브, LP 가격
7. **수익률 정보**: 8시간/일/주/월 수익률, 예상 연간 APY

## 프로덕션 배포 상태
- Vercel 자동 배포: 활성화됨 (GitHub 푸시 시 자동 배포)
- 프로덕션 사이트: https://originkorea.vercel.app
- 마지막 GitHub 푸시: v391 (2026.01.03)

## 데이터 문제 해결됨 ✅
- **트레저리/본드/유동성 데이터**: 관리자 페이지에서 수동 입력 가능
  - /admin/staking 페이지에서 "수동 입력 사용" 스위치 활성화 후 데이터 입력
- **대규모 거래 추적 "추정 데이터"**: POLYGONSCAN_API_KEY 환경변수가 설정되지 않으면 추정 데이터 표시
  - 해결방안: .env.local에 POLYGONSCAN_API_KEY 설정 필요

## 다음 작업 제안
- [ ] Money Flow Index (MFI) 지표 추가
- [ ] Rate of Change (ROC) 지표 추가
- [ ] POLYGONSCAN_API_KEY 환경변수 설정 확인
- [ ] 스테이킹 설정 데이터 Supabase 저장으로 변경 (현재 파일 기반)
