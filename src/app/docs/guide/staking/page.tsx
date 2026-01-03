'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft, Coins, TrendingUp, Wallet, Copy, Check, ExternalLink,
  AlertTriangle, ChevronRight, Info, Shield, Zap, Calculator,
  ArrowRightLeft, Clock, CheckCircle2, DollarSign, Percent, Gift,
  RefreshCw, Target, Lock, Unlock, BarChart3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function StakingGuidePage() {
  const { language } = useLanguage();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const texts = {
    ko: {
      backToGuide: '가이드로 돌아가기',
      title: 'LGNS 구매 및 스테이킹 가이드',
      subtitle: 'QuickSwap에서 LGNS 구매부터 스테이킹까지 완벽 가이드',
      readTime: '예상 소요 시간: 15분',

      intro: {
        title: '이 가이드에서 배우는 것',
        items: [
          'QuickSwap DEX에서 LGNS 토큰 구매 방법',
          'Origin World에서 LGNS 스테이킹하는 방법',
          '스테이킹 보상 확인 및 청구 방법',
          '스테이킹 전략과 수익 최적화 팁',
        ],
      },

      prerequisites: {
        title: '사전 준비사항',
        items: [
          { title: 'TokenPocket 지갑', desc: 'Polygon 네트워크 설정 완료', link: '/docs/guide/wallet' },
          { title: 'POL (MATIC) 토큰', desc: '가스비용으로 최소 1-2 POL 필요' },
          { title: 'DAI 또는 USDC', desc: 'LGNS 구매에 사용할 스테이블코인' },
        ],
      },

      part1: {
        title: 'Part 1: QuickSwap에서 LGNS 구매하기',
        steps: [
          {
            number: 1,
            title: 'QuickSwap 접속',
            duration: '1분',
            content: {
              desc: 'QuickSwap은 Polygon 네트워크의 대표적인 DEX(탈중앙화 거래소)입니다.',
              steps: [
                'TokenPocket 앱의 브라우저(DApp) 탭을 엽니다',
                '주소창에 quickswap.exchange를 입력합니다',
                '또는 아래 버튼으로 직접 접속할 수 있습니다',
              ],
              link: 'https://quickswap.exchange/#/swap?currency0=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&currency1=0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
              linkText: 'QuickSwap LGNS/DAI 페어 바로가기',
            },
          },
          {
            number: 2,
            title: '지갑 연결',
            duration: '1분',
            content: {
              desc: 'QuickSwap에 지갑을 연결하여 거래를 진행합니다.',
              steps: [
                '우측 상단의 "Connect Wallet" 버튼을 클릭합니다',
                '"WalletConnect" 또는 "TokenPocket"을 선택합니다',
                '지갑 앱에서 연결 요청을 승인합니다',
                '연결되면 지갑 주소가 표시됩니다',
              ],
              tip: 'TokenPocket 내장 브라우저에서는 자동으로 연결될 수 있습니다.',
            },
          },
          {
            number: 3,
            title: '토큰 선택 및 금액 입력',
            duration: '2분',
            content: {
              desc: 'DAI로 LGNS를 구매하기 위해 토큰 페어를 설정합니다.',
              steps: [
                '"From" 필드에서 DAI를 선택합니다',
                '"To" 필드에서 LGNS를 검색하여 선택합니다',
                '(LGNS가 안 보이면 컨트랙트 주소로 검색)',
                '구매하고 싶은 DAI 금액을 입력합니다',
                '자동으로 받게 될 LGNS 수량이 표시됩니다',
              ],
              warning: '슬리피지(Slippage)가 높으면 거래가 실패할 수 있습니다. 기본 설정(0.5~1%)을 유지하세요.',
            },
          },
          {
            number: 4,
            title: '거래 승인 및 스왑',
            duration: '2분',
            content: {
              desc: '토큰 사용을 승인하고 스왑을 실행합니다.',
              steps: [
                '처음 거래 시 "Approve DAI" 버튼을 클릭합니다',
                '지갑에서 승인 트랜잭션을 확인합니다',
                '승인이 완료되면 "Swap" 버튼이 활성화됩니다',
                '"Swap" 버튼을 클릭합니다',
                '거래 내용을 확인하고 "Confirm Swap"을 클릭합니다',
                '지갑에서 최종 거래를 승인합니다',
              ],
              tip: '가스비(POL)가 충분한지 확인하세요. 승인과 스왑에 각각 가스비가 필요합니다.',
            },
          },
          {
            number: 5,
            title: '거래 확인',
            duration: '1분',
            content: {
              desc: '거래가 완료되면 LGNS가 지갑에 추가됩니다.',
              steps: [
                '거래 완료 메시지를 확인합니다',
                'TokenPocket 지갑에서 LGNS 잔액을 확인합니다',
                '(토큰이 안 보이면 LGNS 컨트랙트 주소로 추가)',
                'PolygonScan에서 거래 내역을 확인할 수 있습니다',
              ],
            },
          },
        ],
      },

      part2: {
        title: 'Part 2: LGNS 스테이킹하기',
        steps: [
          {
            number: 1,
            title: 'Origin World 접속',
            duration: '1분',
            content: {
              desc: 'Origin World 공식 사이트에서 스테이킹을 진행합니다.',
              steps: [
                'TokenPocket 브라우저에서 originworld.org 접속',
                '또는 일반 브라우저에서 접속 후 WalletConnect로 연결',
                '"Staking" 또는 "스테이킹" 메뉴를 선택합니다',
              ],
              link: 'https://originworld.org',
              linkText: 'Origin World 공식 사이트',
            },
          },
          {
            number: 2,
            title: '스테이킹 풀 선택',
            duration: '2분',
            content: {
              desc: '다양한 스테이킹 풀 중에서 원하는 옵션을 선택합니다.',
              steps: [
                '사용 가능한 스테이킹 풀 목록을 확인합니다',
                '각 풀의 APY(연간 수익률)와 락업 기간을 비교합니다',
                '원하는 풀의 "Stake" 버튼을 클릭합니다',
              ],
              tip: '일반적으로 락업 기간이 길수록 APY가 높습니다. 자금 운용 계획에 맞게 선택하세요.',
            },
          },
          {
            number: 3,
            title: 'LGNS 승인 및 스테이킹',
            duration: '2분',
            content: {
              desc: 'LGNS 토큰 사용을 승인하고 스테이킹을 실행합니다.',
              steps: [
                '스테이킹할 LGNS 수량을 입력합니다',
                '"Approve" 버튼을 클릭하여 토큰 사용을 승인합니다',
                '지갑에서 승인 트랜잭션을 확인합니다',
                '"Stake" 버튼을 클릭합니다',
                '지갑에서 스테이킹 트랜잭션을 확인합니다',
              ],
              warning: '스테이킹된 토큰은 락업 기간 동안 출금할 수 없습니다. 신중하게 결정하세요.',
            },
          },
          {
            number: 4,
            title: '스테이킹 확인',
            duration: '1분',
            content: {
              desc: '스테이킹이 완료되면 대시보드에서 현황을 확인합니다.',
              steps: [
                '"My Stakes" 또는 "내 스테이킹" 섹션으로 이동합니다',
                '스테이킹된 LGNS 수량을 확인합니다',
                '예상 보상과 락업 해제 일자를 확인합니다',
                '누적 보상이 실시간으로 증가하는 것을 볼 수 있습니다',
              ],
            },
          },
        ],
      },

      part3: {
        title: 'Part 3: 보상 청구 및 관리',
        sections: [
          {
            title: '보상 청구하기',
            icon: Gift,
            content: [
              '스테이킹 대시보드에서 "Claim Rewards" 버튼을 찾습니다',
              '청구할 보상 금액을 확인합니다',
              '"Claim" 버튼을 클릭합니다',
              '지갑에서 트랜잭션을 승인합니다',
              '보상 LGNS가 지갑에 입금됩니다',
            ],
            tip: '보상은 언제든지 청구할 수 있지만, 가스비를 고려하여 적절한 금액이 쌓였을 때 청구하는 것이 효율적입니다.',
          },
          {
            title: '언스테이킹 (출금)',
            icon: Unlock,
            content: [
              '락업 기간이 종료된 후 언스테이킹이 가능합니다',
              '"Unstake" 버튼을 클릭합니다',
              '출금할 LGNS 수량을 입력합니다',
              '지갑에서 트랜잭션을 승인합니다',
              'LGNS가 지갑으로 돌아옵니다',
            ],
            warning: '일부 풀은 조기 출금 시 패널티가 있을 수 있습니다. 조건을 반드시 확인하세요.',
          },
          {
            title: '복리 전략',
            icon: RefreshCw,
            content: [
              '보상을 청구하여 다시 스테이킹하면 복리 효과를 얻을 수 있습니다',
              '정기적으로 보상을 재투자하면 수익이 극대화됩니다',
              'Origin 계산기로 복리 수익을 미리 계산해 보세요',
            ],
            link: '/calculator',
            linkText: '스테이킹 계산기 사용하기',
          },
        ],
      },

      tips: {
        title: '스테이킹 전략 팁',
        items: [
          {
            icon: Target,
            title: '분산 스테이킹',
            desc: '모든 자금을 한 풀에 넣지 마세요. 여러 풀에 분산하면 리스크를 줄일 수 있습니다.',
          },
          {
            icon: Clock,
            title: '장기 투자',
            desc: '스테이킹은 장기 투자에 적합합니다. 단기 변동성에 흔들리지 마세요.',
          },
          {
            icon: Calculator,
            title: '수익 계산',
            desc: '투자 전 Origin 계산기로 예상 수익을 먼저 확인하세요.',
          },
          {
            icon: Shield,
            title: '보안 유지',
            desc: '니모닉을 안전하게 보관하고, 의심스러운 사이트에 지갑을 연결하지 마세요.',
          },
        ],
      },

      contracts: {
        title: '주요 컨트랙트 주소',
        items: [
          { name: 'LGNS Token', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01' },
          { name: 'DAI (Polygon)', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
          { name: 'QuickSwap Router', address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' },
        ],
      },

      faq: {
        title: '자주 묻는 질문',
        items: [
          {
            q: '스테이킹 최소 금액이 있나요?',
            a: '풀마다 최소 스테이킹 금액이 다를 수 있습니다. Origin World 사이트에서 각 풀의 조건을 확인하세요.',
          },
          {
            q: '스테이킹 보상은 언제 받나요?',
            a: '보상은 블록마다 자동으로 누적됩니다. 원할 때 언제든지 청구할 수 있습니다.',
          },
          {
            q: 'APY는 변동하나요?',
            a: '네, APY는 총 스테이킹량과 토큰 가격에 따라 변동됩니다. 표시된 APY는 현재 기준 예상치입니다.',
          },
          {
            q: '스테이킹 중에도 토큰 가격 상승 이익을 얻나요?',
            a: '네, 스테이킹된 토큰도 가격 변동의 영향을 받습니다. 가격 상승 시 원금과 보상 모두 가치가 증가합니다.',
          },
          {
            q: '가스비는 얼마나 드나요?',
            a: 'Polygon은 가스비가 저렴합니다. 일반적으로 승인과 스테이킹에 각각 0.01-0.1 POL 정도 소요됩니다.',
          },
        ],
      },

      nextSteps: {
        title: '다음 단계',
        items: [
          { title: '분석 페이지', desc: 'LGNS 실시간 가격과 시장 동향 확인', link: '/analysis', icon: BarChart3 },
          { title: '스테이킹 계산기', desc: '예상 수익 미리 계산해보기', link: '/calculator', icon: Calculator },
          { title: '커뮤니티', desc: '다른 홀더들과 정보 공유', link: '/community', icon: Gift },
        ],
      },

      copyAddress: '주소 복사',
      copied: '복사됨!',
    },
    en: {
      backToGuide: 'Back to Guide',
      title: 'LGNS Purchase & Staking Guide',
      subtitle: 'Complete guide from buying LGNS on QuickSwap to staking',
      readTime: 'Estimated time: 15 minutes',

      intro: {
        title: 'What You Will Learn',
        items: [
          'How to buy LGNS tokens on QuickSwap DEX',
          'How to stake LGNS on Origin World',
          'How to check and claim staking rewards',
          'Staking strategies and profit optimization tips',
        ],
      },

      prerequisites: {
        title: 'Prerequisites',
        items: [
          { title: 'TokenPocket Wallet', desc: 'Polygon network configured', link: '/docs/guide/wallet' },
          { title: 'POL (MATIC) Token', desc: 'Minimum 1-2 POL for gas fees' },
          { title: 'DAI or USDC', desc: 'Stablecoin to purchase LGNS' },
        ],
      },

      part1: {
        title: 'Part 1: Buying LGNS on QuickSwap',
        steps: [
          {
            number: 1,
            title: 'Access QuickSwap',
            duration: '1 min',
            content: {
              desc: 'QuickSwap is a leading DEX (decentralized exchange) on Polygon network.',
              steps: [
                'Open the browser (DApp) tab in TokenPocket app',
                'Enter quickswap.exchange in the address bar',
                'Or access directly using the button below',
              ],
              link: 'https://quickswap.exchange/#/swap?currency0=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&currency1=0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
              linkText: 'Go to QuickSwap LGNS/DAI Pair',
            },
          },
          {
            number: 2,
            title: 'Connect Wallet',
            duration: '1 min',
            content: {
              desc: 'Connect your wallet to QuickSwap to proceed with trading.',
              steps: [
                'Click "Connect Wallet" button in the upper right',
                'Select "WalletConnect" or "TokenPocket"',
                'Approve the connection request in your wallet app',
                'Once connected, your wallet address will be displayed',
              ],
              tip: 'In TokenPocket built-in browser, it may connect automatically.',
            },
          },
          {
            number: 3,
            title: 'Select Tokens and Enter Amount',
            duration: '2 min',
            content: {
              desc: 'Set up the token pair to buy LGNS with DAI.',
              steps: [
                'Select DAI in the "From" field',
                'Search and select LGNS in the "To" field',
                '(If LGNS is not visible, search by contract address)',
                'Enter the amount of DAI you want to spend',
                'The amount of LGNS you will receive is automatically displayed',
              ],
              warning: 'High slippage may cause the transaction to fail. Keep the default setting (0.5-1%).',
            },
          },
          {
            number: 4,
            title: 'Approve and Swap',
            duration: '2 min',
            content: {
              desc: 'Approve token usage and execute the swap.',
              steps: [
                'Click "Approve DAI" button for the first trade',
                'Confirm the approval transaction in your wallet',
                'Once approved, the "Swap" button becomes active',
                'Click the "Swap" button',
                'Review the details and click "Confirm Swap"',
                'Approve the final transaction in your wallet',
              ],
              tip: 'Make sure you have enough gas (POL). Gas is needed for both approval and swap.',
            },
          },
          {
            number: 5,
            title: 'Confirm Transaction',
            duration: '1 min',
            content: {
              desc: 'Once completed, LGNS will be added to your wallet.',
              steps: [
                'Confirm the transaction completion message',
                'Check your LGNS balance in TokenPocket wallet',
                '(If token is not visible, add using LGNS contract address)',
                'You can verify the transaction on PolygonScan',
              ],
            },
          },
        ],
      },

      part2: {
        title: 'Part 2: Staking LGNS',
        steps: [
          {
            number: 1,
            title: 'Access Origin World',
            duration: '1 min',
            content: {
              desc: 'Stake on the official Origin World website.',
              steps: [
                'Access originworld.org in TokenPocket browser',
                'Or access via regular browser and connect with WalletConnect',
                'Select "Staking" menu',
              ],
              link: 'https://originworld.org',
              linkText: 'Origin World Official Site',
            },
          },
          {
            number: 2,
            title: 'Select Staking Pool',
            duration: '2 min',
            content: {
              desc: 'Choose from various staking pools.',
              steps: [
                'View the list of available staking pools',
                'Compare APY (annual percentage yield) and lock-up period',
                'Click "Stake" button on your preferred pool',
              ],
              tip: 'Generally, longer lock-up periods offer higher APY. Choose based on your financial plan.',
            },
          },
          {
            number: 3,
            title: 'Approve and Stake LGNS',
            duration: '2 min',
            content: {
              desc: 'Approve LGNS token usage and execute staking.',
              steps: [
                'Enter the amount of LGNS to stake',
                'Click "Approve" button to authorize token usage',
                'Confirm the approval transaction in your wallet',
                'Click "Stake" button',
                'Confirm the staking transaction in your wallet',
              ],
              warning: 'Staked tokens cannot be withdrawn during the lock-up period. Decide carefully.',
            },
          },
          {
            number: 4,
            title: 'Confirm Staking',
            duration: '1 min',
            content: {
              desc: 'Once staking is complete, check your status on the dashboard.',
              steps: [
                'Go to "My Stakes" section',
                'Verify the amount of staked LGNS',
                'Check expected rewards and unlock date',
                'Watch your accumulated rewards grow in real-time',
              ],
            },
          },
        ],
      },

      part3: {
        title: 'Part 3: Claiming Rewards & Management',
        sections: [
          {
            title: 'Claiming Rewards',
            icon: Gift,
            content: [
              'Find the "Claim Rewards" button on the staking dashboard',
              'Check the reward amount to claim',
              'Click the "Claim" button',
              'Approve the transaction in your wallet',
              'Reward LGNS will be deposited to your wallet',
            ],
            tip: 'Rewards can be claimed anytime, but it is more efficient to claim when a decent amount has accumulated, considering gas fees.',
          },
          {
            title: 'Unstaking (Withdrawal)',
            icon: Unlock,
            content: [
              'Unstaking is available after the lock-up period ends',
              'Click the "Unstake" button',
              'Enter the amount of LGNS to withdraw',
              'Approve the transaction in your wallet',
              'LGNS will return to your wallet',
            ],
            warning: 'Some pools may have penalties for early withdrawal. Be sure to check the terms.',
          },
          {
            title: 'Compound Strategy',
            icon: RefreshCw,
            content: [
              'Claiming rewards and restaking gives compound interest effect',
              'Regular reinvestment maximizes profits',
              'Calculate compound returns with Origin Korea calculator',
            ],
            link: '/calculator',
            linkText: 'Use Staking Calculator',
          },
        ],
      },

      tips: {
        title: 'Staking Strategy Tips',
        items: [
          {
            icon: Target,
            title: 'Diversified Staking',
            desc: "Don't put all your funds in one pool. Diversifying across pools reduces risk.",
          },
          {
            icon: Clock,
            title: 'Long-term Investment',
            desc: "Staking is suitable for long-term investment. Don't be swayed by short-term volatility.",
          },
          {
            icon: Calculator,
            title: 'Calculate Returns',
            desc: 'Check expected returns with Origin Korea calculator before investing.',
          },
          {
            icon: Shield,
            title: 'Maintain Security',
            desc: "Keep your mnemonic safe and don't connect your wallet to suspicious sites.",
          },
        ],
      },

      contracts: {
        title: 'Key Contract Addresses',
        items: [
          { name: 'LGNS Token', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01' },
          { name: 'DAI (Polygon)', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
          { name: 'QuickSwap Router', address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' },
        ],
      },

      faq: {
        title: 'Frequently Asked Questions',
        items: [
          {
            q: 'Is there a minimum staking amount?',
            a: 'Minimum staking amounts may vary by pool. Check the terms of each pool on the Origin World site.',
          },
          {
            q: 'When do I receive staking rewards?',
            a: 'Rewards accumulate automatically with each block. You can claim them anytime you want.',
          },
          {
            q: 'Does APY fluctuate?',
            a: 'Yes, APY varies based on total staking amount and token price. Displayed APY is an estimate based on current conditions.',
          },
          {
            q: 'Do I benefit from token price increases while staking?',
            a: 'Yes, staked tokens are also affected by price changes. When prices rise, both principal and rewards increase in value.',
          },
          {
            q: 'How much are gas fees?',
            a: 'Polygon has low gas fees. Typically, approval and staking each cost about 0.01-0.1 POL.',
          },
        ],
      },

      nextSteps: {
        title: 'Next Steps',
        items: [
          { title: 'Analysis Page', desc: 'Check LGNS real-time price and market trends', link: '/analysis', icon: BarChart3 },
          { title: 'Staking Calculator', desc: 'Calculate expected returns in advance', link: '/calculator', icon: Calculator },
          { title: 'Community', desc: 'Share information with other holders', link: '/community', icon: Gift },
        ],
      },

      copyAddress: 'Copy Address',
      copied: 'Copied!',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToGuide}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">LGNS Staking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {t.subtitle}
            </p>
            <Badge variant="secondary" className="text-sm">
              {t.readTime}
            </Badge>
          </div>

          {/* Introduction */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {t.intro.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-3">
                {t.intro.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="bg-card border-border/60 mb-8">
            <CardHeader>
              <CardTitle>{t.prerequisites.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {t.prerequisites.items.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/30">
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                    {item.link && (
                      <Link href={item.link} className="text-primary text-sm hover:underline">
                        {language === 'ko' ? '가이드 보기 →' : 'View Guide →'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Part 1: QuickSwap */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ArrowRightLeft className="h-6 w-6 text-blue-500" />
              </div>
              {t.part1.title}
            </h2>

            <div className="space-y-6">
              {t.part1.steps.map((step, index) => (
                <Card key={index} className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{step.duration}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{step.content.desc}</p>

                    <div className="space-y-2">
                      {step.content.steps.map((s, sIndex) => (
                        <div key={sIndex} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm font-medium">
                            {sIndex + 1}
                          </div>
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>

                    {step.content.warning && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-destructive">{step.content.warning}</span>
                      </div>
                    )}

                    {step.content.tip && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-blue-400">{step.content.tip}</span>
                      </div>
                    )}

                    {step.content.link && (
                      <a
                        href={step.content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                      >
                        {step.content.linkText}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Part 2: Staking */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Lock className="h-6 w-6 text-green-500" />
              </div>
              {t.part2.title}
            </h2>

            <div className="space-y-6">
              {t.part2.steps.map((step, index) => (
                <Card key={index} className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{step.duration}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{step.content.desc}</p>

                    <div className="space-y-2">
                      {step.content.steps.map((s, sIndex) => (
                        <div key={sIndex} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-sm font-medium">
                            {sIndex + 1}
                          </div>
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>

                    {step.content.warning && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-destructive">{step.content.warning}</span>
                      </div>
                    )}

                    {step.content.tip && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
                        <Info className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-400">{step.content.tip}</span>
                      </div>
                    )}

                    {step.content.link && (
                      <a
                        href={step.content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
                      >
                        {step.content.linkText}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Part 3: Rewards & Management */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Gift className="h-6 w-6 text-yellow-500" />
              </div>
              {t.part3.title}
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {t.part3.sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card key={index} className="bg-card border-border/60">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Icon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Check className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>

                      {section.tip && (
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs text-blue-400">{section.tip}</p>
                        </div>
                      )}

                      {section.warning && (
                        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-xs text-destructive">{section.warning}</p>
                        </div>
                      )}

                      {section.link && (
                        <Link
                          href={section.link}
                          className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                        >
                          {section.linkText}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Strategy Tips */}
          <Card className="bg-card border-border/60 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.tips.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.tips.items.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <div key={index} className="p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{tip.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{tip.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contract Addresses */}
          <Card className="bg-card border-border/60 mb-8">
            <CardHeader>
              <CardTitle>{t.contracts.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {t.contracts.items.map((contract, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="font-medium text-sm">{contract.name}</div>
                    <code className="text-xs text-muted-foreground break-all">{contract.address}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(contract.address, contract.name)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {copiedAddress === contract.name ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="bg-card border-border/60 mb-8">
            <CardHeader>
              <CardTitle>{t.faq.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {t.faq.items.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{item.q}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{item.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>{t.nextSteps.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {t.nextSteps.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.link}
                      className="p-4 rounded-lg bg-background/50 hover:bg-background transition-colors group flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground flex-1">{item.desc}</p>
                      <div className="flex items-center text-primary text-sm mt-2">
                        {language === 'ko' ? '바로가기' : 'Go'}
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
