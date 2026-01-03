'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ko: {
    // Navigation
    'nav.governance': '거버넌스',
    'nav.community': '커뮤니티',
    'nav.docs': '문서',
    'nav.calculator': '계산기',
    'nav.bookmarks': '참고 링크',
    'nav.contact': '문의',
    'nav.analysis': '분석',
    'nav.network': 'Polygon',

    // Hero
    'hero.title': 'ORIGIN KOREA',
    'hero.subtitle': '화폐 자유의 잠금을 해제하고 부의 프라이버시를 보호합니다',
    'hero.description': '알고리즘 통화 LGNS로 구동되는 탈중앙화 금융 운영 시스템',

    // Stats
    'stats.loading': '데이터를 불러오는 중...',
    'stats.error': '데이터를 불러올 수 없습니다',
    'stats.currentPrice': '현재 가격',
    'stats.liquidity': '유동성',
    'stats.volume24h': '24시간 거래량',
    'stats.marketCap': '시가총액',
    'stats.change24h': '24시간 변동률',
    'stats.totalLiquidity': 'Total Liquidity',
    'stats.volume': 'Volume',
    'stats.marketCapDesc': 'Market Cap',

    // Tabs
    'tabs.chart': '실시간 차트',
    'tabs.info': '토큰 정보',

    // Chart
    'chart.title': 'LGNS/DAI 가격 차트',
    'chart.network': 'Polygon Network - QuickSwap',
    'chart.note': '* 샘플 차트 데이터입니다. 실시간 가격은 상단 통계를 참고하세요.',

    // Token Info
    'token.name': 'Longinus (LGNS)',
    'token.description': '알고리즘 자유를 대표하는 LGNS - 탈중앙화되고 프로그래밍 가능하며 인플레이션 강제에 저항합니다',
    'token.intro.title': '프로젝트 소개',
    'token.intro.content': 'ORIGIN은 알고리즘 통화 LGNS를 기반으로 한 탈중앙화 금융 운영 시스템입니다. 익명 스테이블코인 A와 프라이버시 결제 프로토콜 A Pay를 출시하여 디지털 문명의 각성 시대를 시작합니다.',
    'token.features.title': '핵심 특징',
    'token.features.1': '스테이블코인 리저브 계약',
    'token.features.2': '프라이버시 결제 엔진',
    'token.features.3': 'LGNS 본드 생성기',
    'token.features.4': '유동성 라우팅 머신',
    'token.features.5': '익명 보상 프로토콜',
    'token.participate.title': '참여 방법',
    'token.participate.content': 'LGNS를 스테이킹하여 생태계 수익을 획득하세요. 비안정 LGNS와 안정적인 A를 결합한 이중 트랙 시스템을 통해 보상을 받을 수 있습니다.',

    // Staking Calculator
    'staking.title': '스테이킹 수익 계산기',
    'staking.subtitle': 'LGNS를 스테이킹하고 보상을 획득하세요',
    'staking.settings': '스테이킹 설정',
    'staking.settingsDesc': '스테이킹할 LGNS 수량과 기간을 선택하세요',
    'staking.amount': '스테이킹 수량',
    'staking.period': '스테이킹 기간',
    'staking.days': '일',
    'staking.expectedRewards': '예상 수익',
    'staking.expectedRewardsDesc': '일 스테이킹 시 예상되는 보상',
    'staking.stakingAmount': '스테이킹 수량',
    'staking.expectedReward': '예상 보상',
    'staking.totalReceive': '총 수령액',
    'staking.profit': '수익',
    'staking.compoundInterest': '복리 수익 포함',
    'staking.realtime': '실시간 업데이트',
    'staking.note': '* 실제 수익률은 생태계 수요와 사용자 기여도에 따라 조정됩니다.',
    'staking.maxPeriod': '최대 스테이킹 기간',
    'staking.maxAPY': '최대 연간 수익률',
    'staking.autoCompound': '자동 복리 계산',

    // Roadmap
    'roadmap.title': 'ORIGIN KOREA 생태계 계획',
    'roadmap.subtitle': '금융 주권의 진화 로드맵',
    'roadmap.stage1.title': 'ORIGIN 단계',
    'roadmap.stage1.desc': '비스테이블코인 발행 플라이휠 구축, LGNS 프로토콜의 기본 인센티브 메커니즘 완성',
    'roadmap.stage1.features': '스테이블코인 리저브 계약|LGNS 본드 생성기|재무 위험 없는 자금 민팅|기본 유동성 시스템',
    'roadmap.stage2.title': 'AWAKENING 단계',
    'roadmap.stage2.desc': '스테이블코인 A + 프라이버시 결제 프로토콜 A Pay 출시, 암호화 주권 시대 개시',
    'roadmap.stage2.features': '익명 스테이블코인 A|프라이버시 결제 엔진|크로스체인 트랜잭션|DAO 거버넌스 시스템',
    'roadmap.stage3.title': 'ETERNAL 단계',
    'roadmap.stage3.desc': '프로토콜 생태계 완전 자율화, 멀티체인 상호연결, 문명의 자기 진화',
    'roadmap.stage3.features': '완전 탈중앙화 자율 운영|멀티체인 인터커넥션|자기 진화 프로토콜|글로벌 금융 문명 레이어',
    'roadmap.status.completed': '완료',
    'roadmap.status.current': '진행중',
    'roadmap.status.upcoming': '예정',

    // Quick Links
    'links.title': '더 알아보기',
    'links.subtitle': 'Origin Korea의 다양한 기능을 탐색하세요',
    'links.governance.title': '거버넌스',
    'links.governance.desc': 'DAO 투표에 참여하고 프로젝트의 미래를 결정하세요',
    'links.community.title': '커뮤니티',
    'links.community.desc': '글로벌 Origin Korea 커뮤니티와 소통하세요',
    'links.docs.title': '문서',
    'links.docs.desc': '기술 문서와 가이드를 확인하세요',
    'links.calculator.title': '수익 계산기',
    'links.calculator.desc': '복리 스테이킹 수익을 정확하게 계산하세요',
    'links.analysis.title': '분석',
    'links.analysis.desc': '2024년 3월부터 현재까지 유동성 변화 분석',
    'links.bookmarks.title': '참고 링크',
    'links.bookmarks.desc': 'Origin 관련 모든 유용한 링크 모음',
    'links.contact.title': '문의하기',
    'links.contact.desc': '궁금한 점이 있으시면 언제든지 문의하세요',
    'links.settings.title': '알림 설정',
    'links.settings.desc': '푸시 알림 및 가격 알림을 설정하세요',
    'links.comparison.title': '비교 분석',
    'links.comparison.desc': '여러 토큰의 실시간 데이터를 비교 분석하세요',

    // Footer
    'footer.main': 'Origin Korea - 화폐 주권의 시대를 깨우다',
    'footer.data': '실시간 데이터 제공: DexScreener',

    // Community Page
    'community.hero.title': '커뮤니티',
    'community.hero.subtitle': '전 세계 Origin Korea 커뮤니티와 함께 금융 혁명을 이끌어가세요',
    'community.social.title': '소셜 채널',
    'community.events.title': '커뮤니티 이벤트',
    'community.resources.title': '커뮤니티 리소스',
    'community.join': '참여하기',
    'community.comingSoon': '준비중',

    // Auth
    'auth.login': '로그인',
    'auth.signup': '회원가입',
    'auth.logout': '로그아웃',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.confirmPassword': '비밀번호 확인',
    'auth.forgotPassword': '비밀번호 찾기',
    'auth.noAccount': '계정이 없으신가요?',
    'auth.hasAccount': '이미 계정이 있으신가요?',
    'auth.loginSuccess': '로그인 성공',
    'auth.signupSuccess': '회원가입 성공',

    // Admin
    'admin.dashboard': '관리자 대시보드',
    'admin.bookmarks': '북마크 관리',
    'admin.users': '회원 관리',
    'admin.pages': '페이지 권한',
    'admin.addBookmark': '북마크 추가',
    'admin.editBookmark': '북마크 수정',
    'admin.deleteBookmark': '북마크 삭제',
    'admin.totalBookmarks': '총 북마크',
    'admin.totalPages': '총 페이지',
    'admin.systemStatus': '시스템 상태',
    'admin.online': '정상',
    'admin.backToSite': '사이트로 돌아가기',
    'admin.backToDashboard': '대시보드로',

    // Bookmarks Page
    'bookmarks.title': '참고 링크',
    'bookmarks.subtitle': 'Origin 관련 유용한 링크 모음',
    'bookmarks.search': '검색...',
    'bookmarks.all': '전체',
    'bookmarks.noResults': '검색 결과가 없습니다.',
  },
  en: {
    // Navigation
    'nav.governance': 'Governance',
    'nav.community': 'Community',
    'nav.docs': 'Docs',
    'nav.calculator': 'Calculator',
    'nav.bookmarks': 'Bookmarks',
    'nav.contact': 'Contact',
    'nav.analysis': 'Analysis',
    'nav.network': 'Polygon',

    // Hero
    'hero.title': 'ORIGIN KOREA',
    'hero.subtitle': 'Unlock monetary freedom and defend wealth privacy',
    'hero.description': 'Decentralized financial operating system powered by algorithmic currency LGNS',

    // Stats
    'stats.loading': 'Loading data...',
    'stats.error': 'Unable to load data',
    'stats.currentPrice': 'Current Price',
    'stats.liquidity': 'Liquidity',
    'stats.volume24h': '24h Volume',
    'stats.marketCap': 'Market Cap',
    'stats.change24h': '24h Change',
    'stats.totalLiquidity': 'Total Liquidity',
    'stats.volume': 'Volume',
    'stats.marketCapDesc': 'Market Cap',

    // Tabs
    'tabs.chart': 'Live Chart',
    'tabs.info': 'Token Info',

    // Chart
    'chart.title': 'LGNS/DAI Price Chart',
    'chart.network': 'Polygon Network - QuickSwap',
    'chart.note': '* Sample chart data. Please refer to the stats above for real-time prices.',

    // Token Info
    'token.name': 'Longinus (LGNS)',
    'token.description': 'LGNS represents algorithmic freedom—decentralized, programmable, and resistant to inflationary coercion',
    'token.intro.title': 'Project Introduction',
    'token.intro.content': 'ORIGIN is a decentralized financial operating system based on algorithmic currency LGNS. Launching anonymous stablecoin A and privacy payment protocol A Pay to initiate the era of digital civilization awakening.',
    'token.features.title': 'Key Features',
    'token.features.1': 'Stablecoin Reserve Contract',
    'token.features.2': 'Privacy Payment Engine',
    'token.features.3': 'LGNS Bond Generator',
    'token.features.4': 'Liquidity Routing Machine',
    'token.features.5': 'Anonymous Prize Protocol',
    'token.participate.title': 'How to Participate',
    'token.participate.content': 'Stake LGNS to earn ecosystem rewards. Receive rewards through a dual-track system combining non-stable LGNS and stable A.',

    // Staking Calculator
    'staking.title': 'Staking Rewards Calculator',
    'staking.subtitle': 'Stake LGNS and earn rewards',
    'staking.settings': 'Staking Settings',
    'staking.settingsDesc': 'Select LGNS amount and staking period',
    'staking.amount': 'Staking Amount',
    'staking.period': 'Staking Period',
    'staking.days': 'days',
    'staking.expectedRewards': 'Expected Rewards',
    'staking.expectedRewardsDesc': 'Expected rewards for staking period',
    'staking.stakingAmount': 'Staking Amount',
    'staking.expectedReward': 'Expected Reward',
    'staking.totalReceive': 'Total to Receive',
    'staking.profit': 'Profit',
    'staking.compoundInterest': 'Compound Interest Included',
    'staking.realtime': 'Real-time Updates',
    'staking.note': '* Actual returns are adjusted based on ecosystem demand and user contribution.',
    'staking.maxPeriod': 'Max Staking Period',
    'staking.maxAPY': 'Max Annual Yield',
    'staking.autoCompound': 'Auto Compound Calculation',

    // Roadmap
    'roadmap.title': 'ORIGIN KOREA Ecosystem Roadmap',
    'roadmap.subtitle': 'Evolution roadmap of financial sovereignty',
    'roadmap.stage1.title': 'ORIGIN Stage',
    'roadmap.stage1.desc': 'Build non-stablecoin issuance flywheel, complete LGNS protocol native incentive mechanism',
    'roadmap.stage1.features': 'Stablecoin Reserve Contract|LGNS Bond Generator|Risk-free Treasury Minting|Basic Liquidity System',
    'roadmap.stage2.title': 'AWAKENING Stage',
    'roadmap.stage2.desc': 'Launch Stablecoin A + Privacy Payment Protocol A Pay, initiate era of crypto sovereignty',
    'roadmap.stage2.features': 'Anonymous Stablecoin A|Privacy Payment Engine|Cross-chain Transactions|DAO Governance System',
    'roadmap.stage3.title': 'ETERNAL Stage',
    'roadmap.stage3.desc': 'Protocol ecology fully autonomous, multi-chain interconnected, civilization self-evolving',
    'roadmap.stage3.features': 'Full Decentralized Autonomous Operation|Multi-chain Interconnection|Self-evolving Protocol|Global Financial Civilization Layer',
    'roadmap.status.completed': 'Completed',
    'roadmap.status.current': 'In Progress',
    'roadmap.status.upcoming': 'Upcoming',

    // Quick Links
    'links.title': 'Learn More',
    'links.subtitle': 'Explore Origin Korea features',
    'links.governance.title': 'Governance',
    'links.governance.desc': 'Participate in DAO voting and decide the future',
    'links.community.title': 'Community',
    'links.community.desc': 'Connect with global Origin Korea community',
    'links.docs.title': 'Documentation',
    'links.docs.desc': 'Check technical docs and guides',
    'links.calculator.title': 'Rewards Calculator',
    'links.calculator.desc': 'Calculate compound staking rewards accurately',
    'links.analysis.title': 'Analysis',
    'links.analysis.desc': 'Analyze liquidity changes from March 2024 to present',
    'links.bookmarks.title': 'Bookmarks',
    'links.bookmarks.desc': 'Collection of all useful Origin-related links',
    'links.contact.title': 'Contact Us',
    'links.contact.desc': 'Feel free to contact us with any questions',
    'links.settings.title': 'Notifications',
    'links.settings.desc': 'Configure push notifications and price alerts',
    'links.comparison.title': 'Comparison',
    'links.comparison.desc': 'Compare real-time data of multiple tokens',

    // Footer
    'footer.main': 'Origin Korea - Awakening the Era of Financial Sovereignty',
    'footer.data': 'Real-time data powered by DexScreener',

    // Community Page
    'community.hero.title': 'Community',
    'community.hero.subtitle': 'Join the global Origin Korea community to lead the financial revolution',
    'community.social.title': 'Social Channels',
    'community.events.title': 'Community Events',
    'community.resources.title': 'Community Resources',
    'community.join': 'Join',
    'community.comingSoon': 'Coming Soon',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Login successful',
    'auth.signupSuccess': 'Sign up successful',

    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.bookmarks': 'Manage Bookmarks',
    'admin.users': 'Manage Users',
    'admin.pages': 'Page Permissions',
    'admin.addBookmark': 'Add Bookmark',
    'admin.editBookmark': 'Edit Bookmark',
    'admin.deleteBookmark': 'Delete Bookmark',
    'admin.totalBookmarks': 'Total Bookmarks',
    'admin.totalPages': 'Total Pages',
    'admin.systemStatus': 'System Status',
    'admin.online': 'Online',
    'admin.backToSite': 'Back to Site',
    'admin.backToDashboard': 'Back to Dashboard',

    // Bookmarks Page
    'bookmarks.title': 'Bookmarks',
    'bookmarks.subtitle': 'Collection of useful Origin-related links',
    'bookmarks.search': 'Search...',
    'bookmarks.all': 'All',
    'bookmarks.noResults': 'No results found.',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage on mount
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'ko' || saved === 'en')) {
      setLanguageState(saved);
    } else {
      // Default to English (ignore browser language)
      setLanguageState('en');
      localStorage.setItem('language', 'en');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
