# OriginKorea 작업 목록

## 현재 상태 (버전 375)
- **Same 버전**: 375
- **GitHub 저장소**: https://github.com/GoodPhil/OriginKorea
- **프로덕션 URL**: https://originkorea.vercel.app
- **마지막 업데이트**: 2026.01.03

## 완료된 작업 ✅
- [x] **Web3 스마트 컨트랙트 연동** - ethers.js로 블록체인 데이터 조회
- [x] **staking-data API 생성** - 토큰 정보, 수익률 조회
- [x] **StakingInfo 컴포넌트 생성** - 실시간 블록체인 데이터 표시
- [x] **계산기 페이지에 StakingInfo 통합**
- [x] **온체인 분석 페이지 섹션 순서 수정** - 대규모 거래 → 토큰 공급 분석 → 홀더 분포 → 고래 활동 → 고래 지갑
- [x] **OnChainAnalysis에 데이터 전달** - holdersData와 whaleTransactions 데이터 연결
- [x] **GitHub 푸시 완료** - v372 커밋 완료
- [x] **투자 수익률 계산기 복원** - 계산기 페이지에 InvestmentCalculator 컴포넌트 추가
- [x] **Ichimoku Cloud (일목균형표) 지표 추가** - 5개 라인 + 구름대 시각화
- [x] **Parabolic SAR 지표 추가** - 추세 추종 및 손절 포인트
- [x] **ADX (Average Directional Index) 지표 추가** (14일 기간) - 추세 강도 측정
- [x] **OBV (On-Balance Volume) 지표 추가** (20일 MA 포함) - 거래량 분석
- [x] **CCI (Commodity Channel Index) 지표 추가** (20일 기간)
- [x] **Williams %R 차트 컴포넌트 추가** (14일)
- [x] **스토캐스틱 오실레이터 차트 컴포넌트 추가** (%K(14), %D(3))
- [x] **ATR (Average True Range) 차트 컴포넌트 추가** (14일)
- [x] **다크/라이트 모드 스타일 일관성 확인** (CSS 변수 사용)
- [x] MACD 지표 차트 컴포넌트 추가 (12-26-9 설정)
- [x] 볼린저 밴드 차트 컴포넌트 추가 (20일 SMA ± 2σ)
- [x] 기술 분석 페이지에 새 지표 통합
- [x] 이미지 lazy loading 최적화
- [x] 관리자 로그인 문제 해결 - AuthContext 단순화
- [x] 관리자 대시보드 레이아웃 재구성
- [x] 점검 모드 UI 축소 및 공지사항 위젯 추가
- [x] 회원가입 폼에 필수 입력 항목 추가
- [x] SEO 메타태그 개선
- [x] Footer 버전 v372 업데이트

## 프로덕션 배포 상태
- Vercel 자동 배포: 활성화됨 (GitHub 푸시 시 자동 배포)
- 프로덕션 사이트: https://originkorea.vercel.app
- 마지막 GitHub 푸시: v372 (2026.01.03)

## 분석 페이지 구성 - 총 12개 기술 지표
1. **AI 분석 (/ai-analysis)**: AI 시장 심리, 공포/탐욕 지수, AI 예측
2. **기술 분석 (/analysis)**:
   - 실시간 가격 차트
   - RSI 게이지
   - 유동성/거래량 분석
   - MACD 지표
   - 볼린저 밴드
   - 스토캐스틱 오실레이터
   - ATR 변동성 지표
   - Williams %R
   - CCI (상품 채널 지수)
   - OBV (거래량 균형 지표)
   - ADX (평균 방향성 지수)
   - Ichimoku Cloud (일목균형표)
   - Parabolic SAR (손절/반전 지표)
3. **온체인 분석 (/whale-monitor)**:
   - 대규모 거래 추적
   - 토큰 공급 분석
   - 홀더 분포
   - 고래 활동
   - 고래 지갑 추적

## 계산기 페이지 구성
1. **스테이킹 계산기**: 8시간 복리 수익률 계산
2. **투자 수익률 계산기 (ROI)**: 실제 투자 내역 기반 스테이킹 복리 수익 및 ROI 계산

## 다음 작업 제안
- [ ] Money Flow Index (MFI) 지표 추가
- [ ] Rate of Change (ROC) 지표 추가
- [ ] 프로덕션에서 새 기능들 테스트
- [ ] 기술 분석 페이지 성능 최적화 (차트 로딩 속도)
