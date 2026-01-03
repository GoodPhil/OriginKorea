# OriginKorea 작업 목록

## 현재 상태 (버전 384)
- **Same 버전**: 384
- **GitHub 저장소**: https://github.com/GoodPhil/OriginKorea
- **프로덕션 URL**: https://originkorea.vercel.app
- **마지막 업데이트**: 2026.01.03

## 완료된 작업 ✅
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

## 스마트 컨트랙트 주소 (Polygon)
- **LGNS Token**: `0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01`
- **Staking Contract**: `0x1964Ca90474b11FFD08af387b110ba6C96251Bfc`
- **Treasury**: `0x7B9B7d4F870A38e92c9a181B00f9b33cc8Ef5321`
- **Turbine**: `0x07Ff4e06865de4934409Aa6eCea503b08Cc1C78d`
- **QuickSwap LP**: `0x882df4b0fb50a229c3b4124eb18c759911485bfb`

## StakingInfo 기능
1. **리베이스 카운트다운**: 에포크 데이터 기반 다음 리베이스까지 카운트다운
2. **토큰 정보**: 총 공급량, 현재 가격, 시가총액, 24시간 거래량
3. **스테이킹 통계**: TVL, 스테이킹 비율, 스테이킹 인덱스
4. **트레저리 정보**: 트레저리 잔액, 백킹 비율
5. **본드 정보**: 본드 할인율, 본드 가격, 총 채무
6. **유동성 풀**: 총 유동성, LGNS/USDC 리저브, LP 가격
7. **사용자 포트폴리오**: 지갑 연결, 잔액 조회
8. **수익률 정보**: 8시간/일/주/월 수익률, 예상 연간 APY

## 프로덕션 배포 상태
- Vercel 자동 배포: 활성화됨 (GitHub 푸시 시 자동 배포)
- 프로덕션 사이트: https://originkorea.vercel.app
- 마지막 GitHub 푸시: v384 (2026.01.03)

## 다음 작업 제안
- [ ] 사용자 스테이킹 잔액 조회 기능 추가
- [ ] Money Flow Index (MFI) 지표 추가
- [ ] Rate of Change (ROC) 지표 추가
- [ ] 프로덕션에서 새 기능들 테스트
- [ ] 관리자 페이지에 수동 스테이킹 데이터 입력 폼 추가
