'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft, Coins, ArrowRightLeft, Wallet, Copy, Check, ExternalLink,
  AlertTriangle, ChevronRight, Info, Shield, Zap, Calculator,
  Clock, CheckCircle2, DollarSign, Percent, RefreshCw, Target,
  Settings, AlertCircle, ArrowDown, ArrowUp, TrendingUp, Fuel
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function SwapGuidePage() {
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
      title: 'DAI/LGNS 스왑 가이드',
      subtitle: 'QuickSwap에서 DAI와 LGNS를 교환하는 완벽 가이드',
      readTime: '예상 소요 시간: 10분',

      intro: {
        title: '이 가이드에서 배우는 것',
        items: [
          'QuickSwap DEX 기본 사용법',
          'DAI를 LGNS로 스왑하는 방법',
          'LGNS를 DAI로 스왑하는 방법',
          '슬리피지 및 가스비 설정 최적화',
        ],
      },

      prerequisites: {
        title: '사전 준비사항',
        items: [
          { title: 'TokenPocket 지갑', desc: 'Polygon 네트워크 설정 완료', link: '/docs/guide/wallet' },
          { title: 'POL (MATIC) 토큰', desc: '가스비용으로 최소 0.5-1 POL 필요' },
          { title: 'DAI 또는 LGNS', desc: '스왑할 토큰 보유' },
        ],
      },

      whatIsSwap: {
        title: '스왑(Swap)이란?',
        desc: '스왑은 탈중앙화 거래소(DEX)에서 한 토큰을 다른 토큰으로 교환하는 것입니다. 중앙화 거래소와 달리 지갑에서 직접 거래하며, 토큰이 즉시 교환됩니다.',
        benefits: [
          { title: '비수탁형', desc: '거래소에 토큰을 맡기지 않음' },
          { title: '즉시 거래', desc: '몇 초 내에 거래 완료' },
          { title: '24/7 운영', desc: '언제든지 거래 가능' },
          { title: '낮은 수수료', desc: 'Polygon 네트워크의 저렴한 가스비' },
        ],
      },

      contracts: {
        title: '주요 컨트랙트 주소',
        items: [
          { name: 'LGNS Token', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01', desc: 'Longinus 토큰' },
          { name: 'DAI Stablecoin', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', desc: 'DAI 스테이블코인' },
          { name: 'LGNS/DAI Pool', address: '0x882df4b0fb50a229c3b4124eb18c759911485bfb', desc: 'QuickSwap 유동성 풀' },
        ],
        copy: '복사',
        copied: '복사됨!',
      },

      buyLgns: {
        title: 'Part 1: DAI로 LGNS 구매하기',
        steps: [
          {
            number: 1,
            title: 'QuickSwap 접속하기',
            duration: '1분',
            content: {
              desc: 'QuickSwap은 Polygon 네트워크의 대표적인 탈중앙화 거래소(DEX)입니다.',
              steps: [
                'TokenPocket 앱의 "브라우저" 또는 "DApp" 탭을 엽니다',
                '주소창에 quickswap.exchange를 입력합니다',
                '또는 아래 링크를 사용하여 바로 접속합니다',
              ],
              link: 'https://quickswap.exchange/#/swap?currency0=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&currency1=0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
              linkText: 'QuickSwap DAI→LGNS 바로가기',
              tip: 'TokenPocket 내장 브라우저를 사용하면 지갑 연결이 더 쉽습니다.',
            },
          },
          {
            number: 2,
            title: '지갑 연결하기',
            duration: '1분',
            content: {
              desc: 'QuickSwap에서 거래하려면 먼저 지갑을 연결해야 합니다.',
              steps: [
                '우측 상단의 "Connect Wallet" 버튼을 클릭합니다',
                '"WalletConnect" 또는 "TokenPocket"을 선택합니다',
                '지갑 앱에서 연결 요청 팝업이 뜨면 "연결" 또는 "Confirm"을 누릅니다',
                '연결 성공 시 우측 상단에 지갑 주소가 표시됩니다',
              ],
              warning: 'TokenPocket 내장 브라우저에서는 자동으로 연결될 수 있습니다.',
            },
          },
          {
            number: 3,
            title: '토큰 페어 설정하기',
            duration: '1분',
            content: {
              desc: 'DAI를 LGNS로 교환하기 위해 토큰 페어를 설정합니다.',
              steps: [
                '"From" (보내는 토큰) 필드에서 "DAI"를 선택합니다',
                '"To" (받는 토큰) 필드에서 "LGNS"를 검색합니다',
                'LGNS가 검색되지 않으면 컨트랙트 주소를 입력합니다',
                '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
                'LGNS가 표시되면 선택합니다',
              ],
              tip: '자주 사용하는 토큰은 즐겨찾기에 추가하면 다음에 빠르게 찾을 수 있습니다.',
            },
          },
          {
            number: 4,
            title: '금액 입력 및 확인하기',
            duration: '1분',
            content: {
              desc: '스왑할 금액을 입력하고 예상 수령량을 확인합니다.',
              steps: [
                '"From" 필드에 스왑할 DAI 금액을 입력합니다',
                '예상 수령 LGNS 수량이 자동으로 계산됩니다',
                '환율, 수수료, 슬리피지를 확인합니다',
                '"Max" 버튼으로 전체 잔액을 선택할 수도 있습니다',
              ],
              warning: '전체 잔액을 스왑하면 가스비가 부족할 수 있습니다. 약간의 POL을 남겨두세요.',
            },
          },
          {
            number: 5,
            title: '토큰 승인하기 (첫 거래 시)',
            duration: '1분',
            content: {
              desc: '처음 거래하는 토큰은 스마트 컨트랙트 사용을 승인해야 합니다.',
              steps: [
                '"Approve DAI" 버튼을 클릭합니다',
                '지갑에서 승인 트랜잭션 팝업이 나타납니다',
                '가스비를 확인하고 "확인" 또는 "Confirm"을 누릅니다',
                '트랜잭션이 완료될 때까지 기다립니다 (약 5-15초)',
                '승인 완료 후 "Swap" 버튼이 활성화됩니다',
              ],
              tip: '승인은 토큰당 한 번만 필요합니다. 다음 거래부터는 바로 스왑할 수 있습니다.',
            },
          },
          {
            number: 6,
            title: '스왑 실행하기',
            duration: '1분',
            content: {
              desc: '최종 확인 후 스왑을 실행합니다.',
              steps: [
                '"Swap" 버튼을 클릭합니다',
                '거래 상세 내용을 다시 한번 확인합니다',
                '"Confirm Swap" 버튼을 클릭합니다',
                '지갑에서 트랜잭션을 승인합니다',
                '트랜잭션이 완료될 때까지 기다립니다',
                '완료 메시지가 나타나면 성공입니다!',
              ],
              tip: '트랜잭션 해시를 클릭하면 PolygonScan에서 상세 내역을 확인할 수 있습니다.',
            },
          },
        ],
      },

      sellLgns: {
        title: 'Part 2: LGNS를 DAI로 판매하기',
        desc: 'LGNS를 DAI로 교환하는 방법은 구매와 반대입니다.',
        steps: [
          {
            number: 1,
            title: '토큰 페어 반전하기',
            content: {
              desc: '"From"과 "To" 토큰을 반대로 설정합니다.',
              steps: [
                '"From" 필드에서 "LGNS"를 선택합니다',
                '"To" 필드에서 "DAI"를 선택합니다',
                '또는 중앙의 화살표(↓↑) 버튼을 클릭하여 순서를 바꿉니다',
              ],
            },
          },
          {
            number: 2,
            title: '판매 금액 입력하기',
            content: {
              desc: '판매할 LGNS 수량을 입력합니다.',
              steps: [
                '"From" 필드에 판매할 LGNS 수량을 입력합니다',
                '예상 수령 DAI 금액이 자동으로 계산됩니다',
                '환율과 수수료를 확인합니다',
              ],
            },
          },
          {
            number: 3,
            title: '승인 및 스왑하기',
            content: {
              desc: 'LGNS 승인 후 스왑을 실행합니다.',
              steps: [
                '처음 거래 시 "Approve LGNS"를 클릭합니다',
                '승인 완료 후 "Swap"을 클릭합니다',
                '거래 내용을 확인하고 "Confirm Swap"을 클릭합니다',
                '지갑에서 트랜잭션을 승인합니다',
              ],
            },
          },
        ],
      },

      settings: {
        title: '고급 설정',
        items: [
          {
            title: '슬리피지(Slippage) 설정',
            icon: Percent,
            desc: '슬리피지는 거래 실행 시 허용 가능한 가격 변동 범위입니다.',
            tips: [
              '기본값: 0.5% (대부분의 거래에 적합)',
              '변동성이 높을 때: 1-3%로 설정',
              '너무 낮으면: 거래 실패 가능성 증가',
              '너무 높으면: 불리한 가격에 체결될 수 있음',
            ],
            howTo: '우측 상단 설정(⚙️) 아이콘을 클릭하여 슬리피지를 조정할 수 있습니다.',
          },
          {
            title: '가스비(Gas Fee) 최적화',
            icon: Fuel,
            desc: 'Polygon 네트워크는 가스비가 매우 저렴하지만, 최적화할 수 있습니다.',
            tips: [
              '보통 0.001-0.01 POL 정도 소요',
              '네트워크 혼잡 시 가스비 증가 가능',
              '급하지 않은 거래는 가스비가 낮을 때 실행',
              'TokenPocket에서 가스 설정 조절 가능',
            ],
            howTo: '트랜잭션 확인 시 가스비를 확인하고, 지갑 설정에서 조절할 수 있습니다.',
          },
          {
            title: '거래 기한(Deadline) 설정',
            icon: Clock,
            desc: '거래가 일정 시간 내에 완료되지 않으면 자동 취소됩니다.',
            tips: [
              '기본값: 20분 (권장)',
              '급한 거래: 5-10분으로 단축 가능',
              '기한 초과 시 가스비만 소모되고 거래 취소',
            ],
            howTo: '설정에서 "Transaction Deadline"을 조절할 수 있습니다.',
          },
        ],
      },

      priceImpact: {
        title: '가격 영향(Price Impact) 이해하기',
        desc: '큰 금액을 거래할 때 가격에 미치는 영향을 이해해야 합니다.',
        levels: [
          { range: '0.01% 미만', color: 'green', desc: '거의 영향 없음, 최적의 거래' },
          { range: '0.01% - 0.5%', color: 'green', desc: '정상 범위, 안전한 거래' },
          { range: '0.5% - 1%', color: 'yellow', desc: '주의 필요, 금액 분할 고려' },
          { range: '1% 이상', color: 'red', desc: '높은 영향, 거래 분할 권장' },
        ],
        tips: [
          '큰 금액은 여러 번에 나눠서 거래하세요',
          '유동성이 높은 시간대에 거래하세요',
          '가격 영향이 5% 이상이면 거래가 차단됩니다',
        ],
      },

      faq: {
        title: '자주 묻는 질문',
        items: [
          {
            q: '스왑 거래가 실패하는 이유는?',
            a: '주로 슬리피지 설정이 너무 낮거나, 가스비가 부족하거나, 거래 기한이 초과된 경우입니다. 슬리피지를 높이거나 POL 잔액을 확인하세요.',
          },
          {
            q: '토큰이 지갑에 안 보여요',
            a: 'TokenPocket에서 토큰을 수동으로 추가해야 합니다. 토큰 관리에서 LGNS 컨트랙트 주소를 입력하여 추가하세요.',
          },
          {
            q: '승인(Approve)은 왜 필요한가요?',
            a: 'DEX 스마트 컨트랙트가 토큰을 사용하려면 먼저 사용자의 승인이 필요합니다. 이는 보안을 위한 표준 절차입니다.',
          },
          {
            q: '가스비를 절약하려면?',
            a: 'Polygon 네트워크는 이미 가스비가 매우 저렴합니다. 네트워크 혼잡이 적은 시간대에 거래하면 약간 절약할 수 있습니다.',
          },
          {
            q: '거래 취소할 수 있나요?',
            a: '블록체인에 기록된 거래는 취소할 수 없습니다. 하지만 아직 처리되지 않은 거래는 더 높은 가스비로 새 거래를 보내 대체할 수 있습니다.',
          },
        ],
      },

      nextSteps: {
        title: '다음 단계',
        items: [
          { title: 'LGNS 스테이킹하기', desc: '구매한 LGNS로 스테이킹 보상 받기', link: '/docs/guide/staking', icon: TrendingUp },
          { title: '수익 계산기', desc: '스테이킹 수익 미리 계산해보기', link: '/calculator', icon: Calculator },
          { title: '가격 분석', desc: 'LGNS 실시간 가격 및 차트 확인', link: '/analysis', icon: Target },
        ],
      },
    },
    en: {
      backToGuide: 'Back to Guide',
      title: 'DAI/LGNS Swap Guide',
      subtitle: 'Complete guide to swapping DAI and LGNS on QuickSwap',
      readTime: 'Estimated time: 10 minutes',

      intro: {
        title: 'What You Will Learn',
        items: [
          'How to use QuickSwap DEX',
          'How to swap DAI for LGNS',
          'How to swap LGNS for DAI',
          'Optimizing slippage and gas settings',
        ],
      },

      prerequisites: {
        title: 'Prerequisites',
        items: [
          { title: 'TokenPocket Wallet', desc: 'Polygon network configured', link: '/docs/guide/wallet' },
          { title: 'POL (MATIC) Token', desc: 'At least 0.5-1 POL for gas fees' },
          { title: 'DAI or LGNS', desc: 'Tokens to swap' },
        ],
      },

      whatIsSwap: {
        title: 'What is a Swap?',
        desc: 'A swap is exchanging one token for another on a decentralized exchange (DEX). Unlike centralized exchanges, you trade directly from your wallet and tokens are exchanged instantly.',
        benefits: [
          { title: 'Non-custodial', desc: 'No need to deposit tokens to an exchange' },
          { title: 'Instant Trading', desc: 'Trades complete in seconds' },
          { title: '24/7 Operation', desc: 'Trade anytime' },
          { title: 'Low Fees', desc: 'Cheap gas fees on Polygon' },
        ],
      },

      contracts: {
        title: 'Key Contract Addresses',
        items: [
          { name: 'LGNS Token', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01', desc: 'Longinus Token' },
          { name: 'DAI Stablecoin', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', desc: 'DAI Stablecoin' },
          { name: 'LGNS/DAI Pool', address: '0x882df4b0fb50a229c3b4124eb18c759911485bfb', desc: 'QuickSwap Liquidity Pool' },
        ],
        copy: 'Copy',
        copied: 'Copied!',
      },

      buyLgns: {
        title: 'Part 1: Buy LGNS with DAI',
        steps: [
          {
            number: 1,
            title: 'Access QuickSwap',
            duration: '1 min',
            content: {
              desc: 'QuickSwap is the leading DEX on Polygon network.',
              steps: [
                'Open the "Browser" or "DApp" tab in TokenPocket',
                'Enter quickswap.exchange in the address bar',
                'Or use the link below for direct access',
              ],
              link: 'https://quickswap.exchange/#/swap?currency0=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&currency1=0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
              linkText: 'QuickSwap DAI→LGNS Direct Link',
              tip: 'Using TokenPocket\'s built-in browser makes wallet connection easier.',
            },
          },
          {
            number: 2,
            title: 'Connect Wallet',
            duration: '1 min',
            content: {
              desc: 'You need to connect your wallet to trade on QuickSwap.',
              steps: [
                'Click "Connect Wallet" button in the top right',
                'Select "WalletConnect" or "TokenPocket"',
                'Approve the connection request in your wallet app',
                'Your wallet address will be displayed when connected',
              ],
              warning: 'In TokenPocket\'s built-in browser, it may connect automatically.',
            },
          },
          {
            number: 3,
            title: 'Set Token Pair',
            duration: '1 min',
            content: {
              desc: 'Set up the token pair to swap DAI for LGNS.',
              steps: [
                'Select "DAI" in the "From" field',
                'Search for "LGNS" in the "To" field',
                'If LGNS doesn\'t appear, enter the contract address',
                '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
                'Select LGNS when it appears',
              ],
              tip: 'Add frequently used tokens to favorites for quick access.',
            },
          },
          {
            number: 4,
            title: 'Enter Amount and Review',
            duration: '1 min',
            content: {
              desc: 'Enter the amount to swap and review the estimate.',
              steps: [
                'Enter the amount of DAI to swap in "From" field',
                'Expected LGNS amount is calculated automatically',
                'Review exchange rate, fees, and slippage',
                'Use "Max" button to select entire balance',
              ],
              warning: 'Swapping entire balance may leave insufficient gas. Keep some POL.',
            },
          },
          {
            number: 5,
            title: 'Approve Token (First Trade Only)',
            duration: '1 min',
            content: {
              desc: 'First-time trades require approving the smart contract to use your tokens.',
              steps: [
                'Click "Approve DAI" button',
                'Approval transaction popup appears in wallet',
                'Review gas fee and click "Confirm"',
                'Wait for transaction to complete (about 5-15 seconds)',
                '"Swap" button becomes active after approval',
              ],
              tip: 'Approval is only needed once per token. Future trades can swap immediately.',
            },
          },
          {
            number: 6,
            title: 'Execute Swap',
            duration: '1 min',
            content: {
              desc: 'Review and execute the swap.',
              steps: [
                'Click "Swap" button',
                'Review transaction details one more time',
                'Click "Confirm Swap" button',
                'Approve transaction in your wallet',
                'Wait for transaction to complete',
                'Success message appears when done!',
              ],
              tip: 'Click transaction hash to view details on PolygonScan.',
            },
          },
        ],
      },

      sellLgns: {
        title: 'Part 2: Sell LGNS for DAI',
        desc: 'Selling LGNS for DAI is the reverse of buying.',
        steps: [
          {
            number: 1,
            title: 'Reverse Token Pair',
            content: {
              desc: 'Set "From" and "To" tokens in reverse.',
              steps: [
                'Select "LGNS" in the "From" field',
                'Select "DAI" in the "To" field',
                'Or click the arrow button (↓↑) to swap order',
              ],
            },
          },
          {
            number: 2,
            title: 'Enter Sell Amount',
            content: {
              desc: 'Enter the amount of LGNS to sell.',
              steps: [
                'Enter LGNS amount to sell in "From" field',
                'Expected DAI amount is calculated automatically',
                'Review exchange rate and fees',
              ],
            },
          },
          {
            number: 3,
            title: 'Approve and Swap',
            content: {
              desc: 'Approve LGNS and execute the swap.',
              steps: [
                'Click "Approve LGNS" for first trade',
                'After approval, click "Swap"',
                'Review and click "Confirm Swap"',
                'Approve transaction in wallet',
              ],
            },
          },
        ],
      },

      settings: {
        title: 'Advanced Settings',
        items: [
          {
            title: 'Slippage Settings',
            icon: Percent,
            desc: 'Slippage is the acceptable price movement range during trade execution.',
            tips: [
              'Default: 0.5% (suitable for most trades)',
              'High volatility: Set to 1-3%',
              'Too low: Increased chance of trade failure',
              'Too high: May execute at unfavorable price',
            ],
            howTo: 'Click the settings (⚙️) icon in top right to adjust slippage.',
          },
          {
            title: 'Gas Fee Optimization',
            icon: Fuel,
            desc: 'Polygon network has very low gas fees, but you can optimize further.',
            tips: [
              'Usually costs 0.001-0.01 POL',
              'Gas may increase during network congestion',
              'Execute non-urgent trades during low gas times',
              'Adjust gas settings in TokenPocket',
            ],
            howTo: 'Review gas fees when confirming transaction and adjust in wallet settings.',
          },
          {
            title: 'Transaction Deadline',
            icon: Clock,
            desc: 'Trades auto-cancel if not completed within the deadline.',
            tips: [
              'Default: 20 minutes (recommended)',
              'Urgent trades: Shorten to 5-10 minutes',
              'If deadline expires, only gas is consumed and trade cancels',
            ],
            howTo: 'Adjust "Transaction Deadline" in settings.',
          },
        ],
      },

      priceImpact: {
        title: 'Understanding Price Impact',
        desc: 'Understand the impact on price when trading large amounts.',
        levels: [
          { range: 'Below 0.01%', color: 'green', desc: 'Negligible impact, optimal trade' },
          { range: '0.01% - 0.5%', color: 'green', desc: 'Normal range, safe trade' },
          { range: '0.5% - 1%', color: 'yellow', desc: 'Caution needed, consider splitting' },
          { range: 'Above 1%', color: 'red', desc: 'High impact, split trade recommended' },
        ],
        tips: [
          'Split large amounts into multiple trades',
          'Trade during high liquidity times',
          'Trades are blocked if price impact exceeds 5%',
        ],
      },

      faq: {
        title: 'Frequently Asked Questions',
        items: [
          {
            q: 'Why does my swap fail?',
            a: 'Usually due to slippage set too low, insufficient gas, or deadline exceeded. Try increasing slippage or check your POL balance.',
          },
          {
            q: 'Token not showing in wallet',
            a: 'You need to manually add the token in TokenPocket. Go to token management and enter the LGNS contract address.',
          },
          {
            q: 'Why is Approve needed?',
            a: 'DEX smart contracts need user approval to use tokens. This is a standard security procedure.',
          },
          {
            q: 'How to save on gas fees?',
            a: 'Polygon network already has very low gas fees. Trade during less congested times for slight savings.',
          },
          {
            q: 'Can I cancel a trade?',
            a: 'Recorded blockchain transactions cannot be cancelled. However, pending transactions can be replaced by sending a new transaction with higher gas.',
          },
        ],
      },

      nextSteps: {
        title: 'Next Steps',
        items: [
          { title: 'Stake LGNS', desc: 'Earn staking rewards with your LGNS', link: '/docs/guide/staking', icon: TrendingUp },
          { title: 'Calculator', desc: 'Calculate your staking returns', link: '/calculator', icon: Calculator },
          { title: 'Analysis', desc: 'Check real-time LGNS price and charts', link: '/analysis', icon: Target },
        ],
      },
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      {/* Header */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToGuide}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <ArrowRightLeft className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {t.readTime}
            </Badge>
            <Badge variant="outline" className="text-sm">QuickSwap DEX</Badge>
            <Badge variant="outline" className="text-sm">Polygon</Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">

          {/* Introduction */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {t.intro.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {t.intro.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t.prerequisites.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {t.prerequisites.items.map((item, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="font-medium text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                    {'link' in item && item.link && (
                      <Link href={item.link} className="text-xs text-primary hover:underline mt-2 inline-block">
                        {language === 'ko' ? '가이드 보기 →' : 'View Guide →'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What is Swap */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                {t.whatIsSwap.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t.whatIsSwap.desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {t.whatIsSwap.benefits.map((benefit, index) => (
                  <div key={index} className="p-3 bg-secondary/30 rounded-lg text-center">
                    <div className="font-medium text-sm mb-1">{benefit.title}</div>
                    <div className="text-xs text-muted-foreground">{benefit.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Addresses */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                {t.contracts.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {t.contracts.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.address, item.name)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-xs font-mono"
                    >
                      {item.address.slice(0, 6)}...{item.address.slice(-4)}
                      {copiedAddress === item.name ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Part 1: Buy LGNS */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ArrowDown className="h-6 w-6 text-green-500" />
              {t.buyLgns.title}
            </h2>

            {t.buyLgns.steps.map((step, index) => (
              <Card key={index} className="bg-card border-border/60">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      {'duration' in step && (
                        <CardDescription>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {step.duration}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{step.content.desc}</p>

                  <ol className="space-y-2">
                    {step.content.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>

                  {'link' in step.content && step.content.link && (
                    <a
                      href={step.content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {step.content.linkText}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {'warning' in step.content && step.content.warning && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-yellow-200">{step.content.warning}</span>
                    </div>
                  )}

                  {'tip' in step.content && step.content.tip && (
                    <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{step.content.tip}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Part 2: Sell LGNS */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ArrowUp className="h-6 w-6 text-red-500" />
              {t.sellLgns.title}
            </h2>
            <p className="text-muted-foreground">{t.sellLgns.desc}</p>

            {t.sellLgns.steps.map((step, index) => (
              <Card key={index} className="bg-card border-border/60">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{step.content.desc}</p>
                  <ol className="space-y-2">
                    {step.content.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Advanced Settings */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                {t.settings.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {t.settings.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <ul className="space-y-1">
                        {item.tips.map((tip, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-primary" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-primary">{item.howTo}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Price Impact */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                {t.priceImpact.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t.priceImpact.desc}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {t.priceImpact.levels.map((level, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center ${
                      level.color === 'green' ? 'bg-green-500/10 border border-green-500/20' :
                      level.color === 'yellow' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    <div className={`font-bold text-sm ${
                      level.color === 'green' ? 'text-green-500' :
                      level.color === 'yellow' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {level.range}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{level.desc}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <ul className="text-sm space-y-1">
                  {t.priceImpact.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {t.faq.title}
              </CardTitle>
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
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChevronRight className="h-5 w-5 text-primary" />
                {t.nextSteps.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {t.nextSteps.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.link}
                      className="flex items-center gap-3 p-4 bg-background/50 hover:bg-background/80 rounded-lg transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
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
