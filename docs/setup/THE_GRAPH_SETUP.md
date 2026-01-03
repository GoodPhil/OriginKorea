# The Graph API 설정 가이드

## 개요

이 가이드는 LGNS 분석 페이지에서 실제 온체인 유동성 데이터를 사용하기 위한 The Graph Network API 키 설정 방법을 설명합니다.

## The Graph API 키가 필요한 이유

- The Graph의 Hosted Service는 deprecated 되었습니다
- The Graph Network를 사용하려면 API 키가 필요합니다
- API 키 없이도 시뮬레이션 데이터를 사용할 수 있지만, 실제 온체인 TVL 데이터를 원한다면 API 키가 필요합니다

## 설정 방법

### 1. The Graph 계정 생성

1. [The Graph Studio](https://thegraph.com/studio/) 방문
2. 지갑 연결 (MetaMask 등)
3. 계정 생성 완료

### 2. API 키 발급

1. The Graph Studio 대시보드에서 **API Keys** 메뉴 클릭
2. **Create API Key** 버튼 클릭
3. API 키 이름 입력 (예: `originkorea-lgns`)
4. 생성된 API 키 복사

### 3. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```bash
# The Graph Network API Key
THE_GRAPH_API_KEY=your-api-key-here
```

### 4. Netlify 배포 시 환경 변수 설정

1. Netlify 대시보드에서 프로젝트 선택
2. **Site settings** > **Environment variables** 이동
3. **Add a variable** 클릭
4. Key: `THE_GRAPH_API_KEY`, Value: 발급받은 API 키 입력
5. **Save** 클릭
6. 프로젝트 재배포

## 사용되는 서브그래프

현재 설정된 QuickSwap V3 서브그래프:
- **Subgraph ID**: `FqsVPMegvkK4bhnpEjPVNHoeYo83g3Dwu5yvhLzHeC8C`
- **Network**: Polygon
- **Pool Address**: `0x882df4b0fb50a229c3b4124eb18c759911485bfb`

## 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                      /api/analysis                           │
├─────────────────────────────────────────────────────────────┤
│  1. The Graph API 키 확인                                    │
│     └─ 있음 → The Graph Network 사용                         │
│     └─ 없음 → Hosted Service 시도 (deprecated)               │
│                                                              │
│  2. 유동성 히스토리 조회                                      │
│     └─ 성공 → 실제 온체인 TVL 데이터 반환                     │
│     └─ 실패 → 시뮬레이션 데이터 생성 (가격 상관관계 기반)      │
│                                                              │
│  3. GeckoTerminal API에서 OHLCV 데이터 조회                   │
│     └─ 가격, 거래량, 고가/저가 데이터                         │
│                                                              │
│  4. 추가 분석 데이터 계산                                     │
│     └─ 거래량 통계 (일별/주별/월별)                           │
│     └─ 유동성 변동 알림                                       │
│     └─ 가격-유동성 상관관계                                   │
└─────────────────────────────────────────────────────────────┘
```

## API 응답 구조

```typescript
interface AnalysisData {
  current: {
    liquidity: number;
    price: number;
    volume24h: number;
    marketCap: number;
    fdv: number;
    priceChange24h: number;
    priceChange7d: number;
    txns24h: { buys: number; sells: number };
  };
  historical: HistoricalDataPoint[];      // OHLCV 데이터
  liquidityHistory: LiquidityDataPoint[]; // TVL 히스토리
  volumeStats: VolumeStats;               // 거래량 통계
  liquidityAlerts: LiquidityAlert[];      // 유동성 변동 알림
  correlationData: CorrelationData[];     // 상관관계 데이터
  pairInfo: { ... };
  dataSource: string;                     // OHLCV 데이터 출처
  liquidityDataSource: string;            // 유동성 데이터 출처
  theGraphApiKeyConfigured: boolean;      // API 키 설정 여부
}
```

## 요금 정보

- The Graph Network는 쿼리당 GRT 토큰 소비
- 대략 1,000 쿼리당 약 $0.01 ~ $0.05 수준
- 자세한 요금 정보: https://thegraph.com/docs/en/billing/

## 문제 해결

### API 키가 작동하지 않는 경우

1. API 키가 올바르게 복사되었는지 확인
2. 환경 변수가 정확히 설정되었는지 확인
3. 서버 재시작 후 다시 시도

### 유동성 데이터가 없는 경우

1. 서브그래프가 해당 풀을 지원하는지 확인
2. 풀 주소가 올바른지 확인
3. 시뮬레이션 데이터로 폴백됩니다

## 참고 링크

- [The Graph Documentation](https://thegraph.com/docs/)
- [The Graph Studio](https://thegraph.com/studio/)
- [QuickSwap V3 Subgraph](https://thegraph.com/explorer/subgraphs/FqsVPMegvkK4bhnpEjPVNHoeYo83g3Dwu5yvhLzHeC8C)
- [GeckoTerminal API](https://apiguide.geckoterminal.com/)
