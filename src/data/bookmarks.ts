export interface Bookmark {
  id: string;
  category: string;
  name_ko: string;
  name_en: string;
  url: string;
  order: number;
}

export const defaultBookmarks: Bookmark[] = [
  // ===== 1. Origin Official (오리진 공식) =====
  { id: '1', category: 'Origin Official', name_ko: '오리진 공식 홈', name_en: 'Origin Official Home', url: 'https://originworld.org/', order: 1 },
  { id: '2', category: 'Origin Official', name_ko: '오리진 공식 앱 (DApp)', name_en: 'Origin Dapp', url: 'https://origindefi.io/', order: 2 },
  { id: '3', category: 'Origin Official', name_ko: '미디움 문서', name_en: 'Medium', url: 'https://originworld.medium.com/', order: 3 },
  { id: '4', category: 'Origin Official', name_ko: '스토리 백서', name_en: 'Story White Paper', url: 'https://origin-3.gitbook.io/origin-fearless-contract', order: 4 },
  { id: '5', category: 'Origin Official', name_ko: '경제 백서', name_en: 'Economic White Paper', url: 'https://origin-3.gitbook.io/origin-eternal-protocol', order: 5 },
  { id: '6', category: 'Origin Official', name_ko: '기술 백서', name_en: 'Technical White Paper', url: 'https://origin-5.gitbook.io/anubis-free-reels', order: 6 },
  { id: '7', category: 'Origin Official', name_ko: 'PolygonScan (LGNS 토큰)', name_en: 'PolygonScan (Token LGNS)', url: 'https://polygonscan.com/token/0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01#balances', order: 7 },

  // ===== 2. Info (정보) =====
  { id: '40', category: 'Info', name_ko: 'Coinmarketcap DEX (실시간 데이터)', name_en: 'Coinmarketcap Dex (Real-time)', url: 'https://dex.coinmarketcap.com/token/polygon/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01/', order: 1 },
  { id: '41', category: 'Info', name_ko: 'Coinbase (LGNS 가격)', name_en: 'Coinbase (LGNS Price)', url: 'https://www.coinbase.com/price/origin-lgns', order: 2 },
  { id: '42', category: 'Info', name_ko: 'Coingecko (LGNS 차트)', name_en: 'Coingecko (LGNS Charts)', url: 'https://www.coingecko.com/ko/coins/origin-lgns', order: 3 },
  { id: '43', category: 'Info', name_ko: 'TradingView (LGNS/DAI 차트)', name_en: 'TradingView (LGNS/DAI Chart)', url: 'https://kr.tradingview.com/symbols/LGNSDAI_882DF4.USD/', order: 4 },
  { id: '44', category: 'Info', name_ko: 'Forbes (LGNS 가격)', name_en: 'Forbes (LGNS Price)', url: 'https://www.forbes.com/digital-assets/assets/origin-lgns-lgns/', order: 5 },
  { id: '45', category: 'Info', name_ko: 'OKX (Polygon 차트)', name_en: 'OKX (Polygon Chart)', url: 'https://web3.okx.com/token/polygon/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01', order: 6 },
  { id: '46', category: 'Info', name_ko: 'GeckoTerminal (QuickSwap)', name_en: 'GeckoTerminal (QuickSwap)', url: 'https://www.geckoterminal.com/polygon_pos/pools/0x882df4b0fb50a229c3b4124eb18c759911485bfb', order: 7 },
  { id: '47', category: 'Info', name_ko: 'AVE (가격 차트)', name_en: 'AVE (Price Chart)', url: 'https://ave.ai/token/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01-polygon?from=Home', order: 8 },
  { id: '48', category: 'Info', name_ko: 'Zapper (LGNS on Polygon)', name_en: 'Zapper (LGNS on Polygon)', url: 'https://zapper.xyz/token/polygon/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01/LGNS/details?tab=overview', order: 9 },
  { id: '49', category: 'Info', name_ko: 'Coinstats (실시간 가격)', name_en: 'Coinstats (Real-time Price)', url: 'https://coinstats.app/ko/coins/origin-lgns/', order: 10 },
  { id: '401', category: 'Info', name_ko: 'Binance Square (DeFi 3.0 출시)', name_en: 'Binance Square (DeFi 3.0 Launch)', url: 'https://www.binance.com/en/square/post/03-16-2024-defi-3-0-origin-5466478430618', order: 11 },
  { id: '402', category: 'Info', name_ko: 'Binance Square (QuickSwap Top 5)', name_en: 'Binance Square (QuickSwap Top 5)', url: 'https://www.binance.com/en/square/post/10617615368202', order: 12 },

  // ===== 3. Scale Information (스케일 정보) =====
  { id: '20', category: 'Scale Information', name_ko: 'Polygonscan (토큰 정보)', name_en: 'Polygonscan (Token Info)', url: 'https://polygonscan.com/token/0xeB51D9A39AD5EEF215dC0Bf39a8821ff804a0f01#balances', order: 1 },
  { id: '21', category: 'Scale Information', name_ko: 'Token Supply Checker', name_en: 'Token Supply Checker', url: 'https://polygonscan.com/tokencheck-tool', order: 2 },
  { id: '22', category: 'Scale Information', name_ko: 'Dexscreener (Polygon)', name_en: 'Dexscreener (Polygon)', url: 'https://dexscreener.com/polygon', order: 3 },
  { id: '23', category: 'Scale Information', name_ko: 'GeckoTerminal (Polygon POS 풀)', name_en: 'GeckoTerminal (Polygon POS Pools)', url: 'https://www.geckoterminal.com/ko/polygon_pos/pools', order: 4 },
  { id: '24', category: 'Scale Information', name_ko: 'Coingecko (LGNS 히스토리)', name_en: 'Coingecko (LGNS Historical)', url: 'https://www.coingecko.com/ko/coins/origin-lgns/historical_data', order: 5 },

  // ===== 4. Audit (감사) =====
  { id: '30', category: 'Audit', name_ko: 'CertiK (보안 감사)', name_en: 'CertiK (Security Audit)', url: 'https://skynet.certik.com/ko/projects/origin#code-security', order: 1 },
  { id: '31', category: 'Audit', name_ko: 'TokenSecurity (보안 탐지)', name_en: 'TokenSecurity (Security Report)', url: 'https://tokensecurity.tptool.pro/?locale=en&utm_source=tokenpocket#/?address=0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01&ns=ethereum&chain_id=137&blockchain_id=18', order: 2 },
  { id: '32', category: 'Audit', name_ko: 'De.fi Scanner (스마트 계약)', name_en: 'De.fi Scanner (Smart Contract)', url: 'https://de.fi/scanner', order: 3 },
  { id: '321', category: 'Audit', name_ko: 'De.fi (Polygon LGNS 감사)', name_en: 'De.fi (Polygon LGNS Audit)', url: 'https://de.fi/scanner/contract/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01?chainId=plg', order: 4 },
  { id: '33', category: 'Audit', name_ko: 'GOPLUS Security (토큰 보안)', name_en: 'GOPLUS (Token Security)', url: 'https://gopluslabs.io/token-security/137/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01', order: 5 },
  { id: '34', category: 'Audit', name_ko: 'TokenSniffer', name_en: 'TokenSniffer', url: 'https://tokensniffer.com/token/poly/0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01', order: 6 },
  { id: '35', category: 'Audit', name_ko: 'Cyberscope (보안 스캔)', name_en: 'Cyberscope (Security Scan)', url: 'https://www.cyberscope.io/cyberscan?chainId=137&address=0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01#security', order: 7 },
  { id: '36', category: 'Audit', name_ko: 'Zapper (온체인 활동)', name_en: 'Zapper (On-chain Activity)', url: 'https://zapper.xyz/?trendingType=trending', order: 8 },
  { id: '37', category: 'Audit', name_ko: 'RootData (프로젝트 정보)', name_en: 'RootData (Project Info)', url: 'https://ko.rootdata.com/Projects/detail/ORIGIN?k=MTU5NTY%3D', order: 9 },

  // ===== 5. X (Twitter) =====
  { id: '10', category: 'X (Twitter)', name_ko: 'Origin 공식 X 계정', name_en: 'Origin Official X', url: 'https://x.com/SaluteOrigin', order: 1 },
  { id: '11', category: 'X (Twitter)', name_ko: '2023.10.30 - 오리진 출시 준비', name_en: '2023.10.30 - Launch Prep', url: 'https://x.com/SaluteOrigin/status/1718888173244453181', order: 2 },
  { id: '12', category: 'X (Twitter)', name_ko: '2023.11.16 - DeFi 3.0 발표', name_en: '2023.11.16 - DeFi 3.0', url: 'https://x.com/SaluteOrigin/status/1724922219682242967', order: 3 },
  { id: '121', category: 'X (Twitter)', name_ko: '2023.11.20 - 경제 플라이휠', name_en: '2023.11.20 - Economic Flywheel', url: 'https://x.com/SaluteOrigin/status/1726316443355304088', order: 4 },
  { id: '122', category: 'X (Twitter)', name_ko: '2023.11.28 - 통제 금융 모델', name_en: '2023.11.28 - Control Finance', url: 'https://x.com/SaluteOrigin/status/1729505194268872716', order: 5 },
  { id: '123', category: 'X (Twitter)', name_ko: '2023.12.06 - 알고리즘 업데이트', name_en: '2023.12.06 - Algorithm Update', url: 'https://x.com/SaluteOrigin/status/1732117082962264266', order: 6 },
  { id: '124', category: 'X (Twitter)', name_ko: '2023.12.18 - 글로벌 모집 시작', name_en: '2023.12.18 - Global Recruitment', url: 'https://x.com/SaluteOrigin/status/1736676123986301263', order: 7 },
  { id: '125', category: 'X (Twitter)', name_ko: '2024.02.23 - 프로토콜 완료', name_en: '2024.02.23 - Protocol Complete', url: 'https://x.com/SaluteOrigin/status/1760955559581474907', order: 8 },
  { id: '13', category: 'X (Twitter)', name_ko: '2024.03.05 - 글로벌 런칭', name_en: '2024.03.05 - Global Launch', url: 'https://x.com/SaluteOrigin/status/1764958425757458591', order: 9 },
  { id: '14', category: 'X (Twitter)', name_ko: '2024.03.21 - Bitget 파트너십', name_en: '2024.03.21 - Bitget Partnership', url: 'https://x.com/SaluteOrigin/status/1770771929172935011', order: 10 },

  // ===== 6. News (뉴스) =====
  { id: '70', category: 'News', name_ko: 'TokenPost', name_en: 'TokenPost', url: 'https://www.tokenpost.kr/', order: 1 },
  { id: '71', category: 'News', name_ko: 'BeinCrypto Korea', name_en: 'BeinCrypto Korea', url: 'https://kr.beincrypto.com/', order: 2 },
  { id: '72', category: 'News', name_ko: '블록미디어', name_en: 'BlockMedia', url: 'https://www.blockmedia.co.kr/', order: 3 },
  { id: '73', category: 'News', name_ko: '2025 Q1 180만개 토큰 급증', name_en: '2025 Q1 180M Tokens', url: 'https://www.tokenpost.kr/article-167996', order: 4 },
  { id: '74', category: 'News', name_ko: '암호화폐 규정 2027년 시행', name_en: 'Crypto Regulations 2027', url: 'https://www.edaily.co.kr/news/read?newsId=01245846638889904', order: 5 },
  { id: '75', category: 'News', name_ko: 'CEX vs DEX 거래소 경쟁', name_en: 'CEX vs DEX Competition', url: 'https://www.blockmedia.co.kr/archives/670776', order: 6 },

  // ===== 7. Topic & Issue (주제 & 이슈) =====
  { id: '60', category: 'Topic & Issue', name_ko: 'CompaniesMarketCap (시총 순위)', name_en: 'CompaniesMarketCap', url: 'https://companiesmarketcap.com/', order: 1 },
  { id: '61', category: 'Topic & Issue', name_ko: 'TradingView (암호화폐 시총)', name_en: 'TradingView (Crypto MCap)', url: 'https://kr.tradingview.com/symbols/CRYPTOCAP-TOTAL/', order: 2 },
  { id: '62', category: 'Topic & Issue', name_ko: 'Kimpua (김치프리미엄)', name_en: 'Kimpua (Kimchi Premium)', url: 'https://www.kimpua.com/', order: 3 },
  { id: '63', category: 'Topic & Issue', name_ko: 'CoinMarketCap 시장 개요', name_en: 'CoinMarketCap Market Overview', url: 'https://coinmarketcap.com/charts/', order: 4 },
  { id: '64', category: 'Topic & Issue', name_ko: 'CoinMarketCap 추천 암호화폐', name_en: 'CoinMarketCap Best Cryptos', url: 'https://coinmarketcap.com/ko/best-cryptos/', order: 5 },
  { id: '65', category: 'Topic & Issue', name_ko: 'ChainCatcher (보안 사고)', name_en: 'ChainCatcher (Security Incidents)', url: 'https://www.chaincatcher.com/exploit', order: 6 },

  // ===== 8. Defi Comparison (DeFi 비교) =====
  { id: '80', category: 'Defi Comparison', name_ko: 'Dexscreener Watchlist', name_en: 'Dexscreener Watchlist', url: 'https://dexscreener.com/watchlist', order: 1 },
  { id: '81', category: 'Defi Comparison', name_ko: 'DefiLlama (TVL 비교)', name_en: 'DefiLlama (TVL Compare)', url: 'https://defillama.com/', order: 2 },
  { id: '82', category: 'Defi Comparison', name_ko: 'DeFi Pulse', name_en: 'DeFi Pulse', url: 'https://www.defipulse.com/', order: 3 },

  // ===== 9. Manual (매뉴얼) =====
  { id: '50', category: 'Manual', name_ko: 'LGNS ABI (GitHub)', name_en: 'LGNS ABI (GitHub)', url: 'https://github.com/OriginBank/lgns-abi', order: 1 },
  { id: '51', category: 'Manual', name_ko: 'LGNS ABI - OlympusStaking', name_en: 'LGNS ABI - OlympusStaking', url: 'https://github.com/OriginBank/lgns-abi/blob/main/abis/OlympusStakingv2.json', order: 2 },
  { id: '52', category: 'Manual', name_ko: 'Ethereum 스마트 계약 도구', name_en: 'Ethereum Smart Contract Tool', url: 'https://abi.hashex.org/', order: 3 },

  // ===== 10. Other (기타) =====
  { id: '90', category: 'Other', name_ko: 'Originworld.org 도메인 정보', name_en: 'Originworld.org Domain Info', url: 'https://www.whois.com/whois/originworld.org', order: 1 },
  { id: '91', category: 'Other', name_ko: 'OriginDefi.io 도메인 정보', name_en: 'OriginDefi.io Domain Info', url: 'https://www.whois.com/whois/origindefi.io', order: 2 },
  { id: '92', category: 'Other', name_ko: 'Forbes Digital Assets', name_en: 'Forbes Digital Assets', url: 'https://www.forbes.com/digital-assets/', order: 3 },
];

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return defaultBookmarks;
  const saved = localStorage.getItem('adminBookmarks');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultBookmarks;
    }
  }
  return defaultBookmarks;
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminBookmarks', JSON.stringify(bookmarks));
}

export function getCategories(bookmarks: Bookmark[]): string[] {
  // Return categories in the preferred order
  const categoryOrder = [
    'Origin Official',
    'Info',
    'Scale Information',
    'Audit',
    'X (Twitter)',
    'News',
    'Topic & Issue',
    'Defi Comparison',
    'Manual',
    'Other',
  ];

  const existingCategories = [...new Set(bookmarks.map(b => b.category))];

  // Sort by preferred order, then alphabetically for any not in the list
  return existingCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}
