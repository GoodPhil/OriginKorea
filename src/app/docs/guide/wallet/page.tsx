'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft, Download, Smartphone, Key, Shield, Wallet, Copy, Check,
  AlertTriangle, ChevronRight, ExternalLink, QrCode, ArrowDownToLine,
  CheckCircle2, XCircle, Info, Lock, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function WalletGuidePage() {
  const { language } = useLanguage();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const texts = {
    ko: {
      backToGuide: '가이드로 돌아가기',
      title: 'TokenPocket 지갑 설치 가이드',
      subtitle: 'Android 사용자를 위한 Polygon 지갑 설정 완벽 가이드',
      readTime: '예상 소요 시간: 10분',
      intro: {
        title: '시작하기 전에',
        desc: '이 가이드는 한국의 안드로이드 사용자가 TokenPocket 지갑을 설치하고, Polygon 네트워크 계정을 생성하여 암호화폐를 수신하는 방법을 단계별로 안내합니다.',
        requirements: [
          'Android 스마트폰 (Android 6.0 이상)',
          'Google Play 스토어 접근 가능',
          '안정적인 인터넷 연결',
          '종이와 펜 (니모닉 백업용)',
        ],
      },
      steps: [
        {
          number: 1,
          title: 'Google Play 스토어에서 TokenPocket 설치',
          duration: '2분',
          content: {
            desc: 'Google Play 스토어에서 공식 TokenPocket 앱을 다운로드합니다.',
            steps: [
              'Google Play 스토어 앱을 엽니다',
              '검색창에 "TokenPocket"을 입력합니다',
              '개발자가 "TP Global Ltd"인 공식 앱을 찾습니다',
              '"설치" 버튼을 눌러 앱을 다운로드합니다',
              '설치가 완료되면 "열기"를 눌러 앱을 실행합니다',
            ],
            warning: '주의: 유사한 이름의 가짜 앱이 있을 수 있습니다. 반드시 공식 개발자(TP Global Ltd)의 앱인지 확인하세요.',
            link: 'https://play.google.com/store/apps/details?id=vip.mytokenpocket',
          },
          image: 'https://www.tokenpocket.pro/_nuxt/img/download-img-en.9e8573d.png',
        },
        {
          number: 2,
          title: '앱 실행 및 새 지갑 생성',
          duration: '1분',
          content: {
            desc: 'TokenPocket 앱을 처음 실행하고 새로운 지갑을 생성합니다.',
            steps: [
              '앱이 실행되면 "새 지갑 생성(Create Wallet)"을 선택합니다',
              '서비스 약관에 동의합니다',
              '"HD Wallet" 옵션을 선택합니다 (권장)',
              '지갑 비밀번호를 설정합니다 (8자리 이상, 영문+숫자 조합 권장)',
              '비밀번호를 다시 입력하여 확인합니다',
            ],
            tip: 'HD Wallet은 하나의 니모닉으로 여러 블록체인 주소를 관리할 수 있어 편리합니다.',
          },
          image: 'https://help.tokenpocket.pro/en/~gitbook/image?url=https%3A%2F%2F2516903027-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MMJyYRLFVRsMrfcXuRV%252Fuploads%252FrjoCgH5QlDfdLoIxDPZi%252F1.png%3Falt%3Dmedia%26token%3D65489fd3-3d88-479a-a9aa-eee8fa528016&width=768&dpr=2&quality=100&sign=3fdd3f8a&sv=2',
        },
        {
          number: 3,
          title: '니모닉(복구 문구) 백업 - 매우 중요!',
          duration: '5분',
          content: {
            desc: '니모닉은 지갑을 복구할 수 있는 유일한 방법입니다. 반드시 안전하게 백업하세요.',
            steps: [
              '화면에 표시된 12개(또는 24개)의 영어 단어를 순서대로 확인합니다',
              '종이에 순서대로 정확하게 단어를 적습니다',
              '적은 내용을 다시 한번 확인합니다',
              '"다음"을 눌러 니모닉 확인 단계로 이동합니다',
              '순서대로 단어를 선택하여 백업을 완료합니다',
            ],
          },
          image: 'https://help.tokenpocket.pro/en/~gitbook/image?url=https%3A%2F%2F2516903027-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MMJyYRLFVRsMrfcXuRV%252Fuploads%252FHL3w5avwkXhGBa9DZzU2%252F1.png%3Falt%3Dmedia%26token%3De0841426-2056-4afa-bbef-f240af6ef34b&width=768&dpr=2&quality=100&sign=41d84e8&sv=2',
        },
        {
          number: 4,
          title: 'Polygon(MATIC) 네트워크 선택',
          duration: '1분',
          content: {
            desc: 'LGNS 토큰이 운영되는 Polygon 네트워크를 선택하여 지갑을 생성합니다.',
            steps: [
              '지갑 메인 화면에서 우측 상단의 "+" 또는 네트워크 아이콘을 탭합니다',
              '"Select A Network" 화면에서 스크롤하여 "Polygon (Matic)"을 찾습니다',
              '"Polygon (Matic)"을 선택합니다',
              'HD Wallet이면 자동으로 Polygon 주소가 생성됩니다',
              '새 지갑이면 같은 니모닉으로 Polygon 지갑이 추가됩니다',
            ],
            tip: 'Polygon은 이더리움 레이어2 네트워크로, 빠르고 저렴한 거래가 가능합니다.',
          },
          image: 'https://miro.medium.com/v2/resize:fit:1400/1*xphG3lz9BEhB6RUqYW3PqQ.png',
        },
        {
          number: 5,
          title: 'Polygon 주소 확인 및 토큰 수신',
          duration: '1분',
          content: {
            desc: '생성된 Polygon 지갑 주소를 확인하고 토큰을 받을 준비를 합니다.',
            steps: [
              'Assets 탭에서 "MATIC" 또는 Polygon 네트워크가 표시되는지 확인합니다',
              '"Receive" 버튼을 탭합니다',
              'QR 코드와 함께 지갑 주소(0x로 시작)가 표시됩니다',
              '주소를 복사하거나 QR 코드를 공유하여 토큰을 받을 수 있습니다',
              '누군가가 이 주소로 POL(MATIC)을 전송하면 자동으로 잔액에 반영됩니다',
            ],
            tip: '주소를 공유할 때는 QR 코드를 사용하면 실수를 줄일 수 있습니다.',
          },
          image: 'https://www.tokenpocket.pro/_nuxt/img/android-2-en.3a52edb.png',
        },
      ],
      mnemonicWarning: {
        title: '니모닉(복구 문구) 보안 수칙',
        subtitle: '니모닉을 잃어버리면 지갑을 영구적으로 잃게 됩니다',
        dos: [
          '종이에 적어 안전한 곳에 보관하세요',
          '여러 곳에 분산 보관하세요',
          '가족에게 보관 위치를 알려두세요',
          '방수/방화 처리된 곳에 보관하세요',
        ],
        donts: [
          '스크린샷으로 저장하지 마세요',
          '클라우드에 저장하지 마세요',
          '메모 앱에 저장하지 마세요',
          '누구에게도 공유하지 마세요',
          'SNS나 메시지로 전송하지 마세요',
        ],
        important: '니모닉을 아는 사람은 누구든 지갑의 모든 자산에 접근할 수 있습니다. 절대 다른 사람에게 알려주지 마세요!',
      },
      faq: {
        title: '자주 묻는 질문',
        items: [
          {
            q: 'TokenPocket은 안전한가요?',
            a: 'TokenPocket은 2018년부터 운영되어 온 신뢰할 수 있는 지갑입니다. 개인 키는 기기에만 저장되며 서버로 전송되지 않습니다. 단, 니모닉 관리는 사용자의 책임입니다.',
          },
          {
            q: 'POL(MATIC)과 Polygon의 차이는 무엇인가요?',
            a: 'Polygon은 네트워크 이름이고, POL(구 MATIC)은 해당 네트워크의 기본 토큰입니다. 가스비(수수료)를 지불할 때 사용됩니다.',
          },
          {
            q: '니모닉을 잃어버리면 어떻게 하나요?',
            a: '안타깝게도 니모닉을 잃어버리면 지갑을 복구할 방법이 없습니다. 기기에서 앱을 삭제하거나 기기를 분실하면 자산에 영구적으로 접근할 수 없습니다.',
          },
          {
            q: 'LGNS 토큰은 어떻게 추가하나요?',
            a: 'Polygon 네트워크에서 Assets 탭의 "+" 버튼을 누르고, LGNS 토큰 컨트랙트 주소(0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01)를 입력하여 추가할 수 있습니다.',
          },
          {
            q: 'POL은 왜 필요한가요?',
            a: 'Polygon 네트워크에서 거래(트랜잭션)를 할 때마다 소액의 POL이 가스비로 사용됩니다. LGNS를 전송하거나 스왑할 때도 POL이 필요합니다.',
          },
        ],
      },
      nextSteps: {
        title: '다음 단계',
        items: [
          { title: 'QuickSwap에서 LGNS 구매하기', desc: 'DEX에서 LGNS 토큰 구매 방법', link: '/docs/guide/staking' },
          { title: '스테이킹 가이드', desc: 'LGNS 스테이킹으로 수익 얻기', link: '/docs/guide/staking' },
          { title: '분석 페이지 활용법', desc: '실시간 데이터로 투자 판단하기', link: '/analysis' },
        ],
      },
      lgnsContract: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
      copyAddress: '주소 복사',
      copied: '복사됨!',
    },
    en: {
      backToGuide: 'Back to Guide',
      title: 'TokenPocket Wallet Setup Guide',
      subtitle: 'Complete Polygon Wallet Setup Guide for Android Users',
      readTime: 'Estimated time: 10 minutes',
      intro: {
        title: 'Before You Start',
        desc: 'This guide walks Korean Android users through installing TokenPocket wallet, creating a Polygon network account, and receiving cryptocurrency step by step.',
        requirements: [
          'Android smartphone (Android 6.0 or higher)',
          'Access to Google Play Store',
          'Stable internet connection',
          'Paper and pen (for mnemonic backup)',
        ],
      },
      steps: [
        {
          number: 1,
          title: 'Install TokenPocket from Google Play Store',
          duration: '2 min',
          content: {
            desc: 'Download the official TokenPocket app from Google Play Store.',
            steps: [
              'Open the Google Play Store app',
              'Type "TokenPocket" in the search bar',
              'Find the official app by developer "TP Global Ltd"',
              'Tap "Install" to download the app',
              'Once installed, tap "Open" to launch the app',
            ],
            warning: 'Warning: There may be fake apps with similar names. Always verify the developer is "TP Global Ltd".',
            link: 'https://play.google.com/store/apps/details?id=vip.mytokenpocket',
          },
          image: 'https://www.tokenpocket.pro/_nuxt/img/download-img-en.9e8573d.png',
        },
        {
          number: 2,
          title: 'Launch App and Create New Wallet',
          duration: '1 min',
          content: {
            desc: 'Launch TokenPocket for the first time and create a new wallet.',
            steps: [
              'When the app opens, select "Create Wallet"',
              'Agree to the terms of service',
              'Select the "HD Wallet" option (recommended)',
              'Set a wallet password (8+ characters, mix of letters and numbers recommended)',
              'Re-enter password to confirm',
            ],
            tip: 'HD Wallet allows you to manage multiple blockchain addresses with a single mnemonic.',
          },
          image: 'https://help.tokenpocket.pro/en/~gitbook/image?url=https%3A%2F%2F2516903027-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MMJyYRLFVRsMrfcXuRV%252Fuploads%252FrjoCgH5QlDfdLoIxDPZi%252F1.png%3Falt%3Dmedia%26token%3D65489fd3-3d88-479a-a9aa-eee8fa528016&width=768&dpr=2&quality=100&sign=3fdd3f8a&sv=2',
        },
        {
          number: 3,
          title: 'Backup Mnemonic (Recovery Phrase) - Very Important!',
          duration: '5 min',
          content: {
            desc: 'The mnemonic is the only way to recover your wallet. Back it up safely.',
            steps: [
              'View the 12 (or 24) English words displayed on screen in order',
              'Write down the words on paper exactly in order',
              'Double-check what you wrote',
              'Tap "Next" to proceed to mnemonic verification',
              'Select words in order to complete the backup',
            ],
          },
          image: 'https://help.tokenpocket.pro/en/~gitbook/image?url=https%3A%2F%2F2516903027-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MMJyYRLFVRsMrfcXuRV%252Fuploads%252FHL3w5avwkXhGBa9DZzU2%252F1.png%3Falt%3Dmedia%26token%3De0841426-2056-4afa-bbef-f240af6ef34b&width=768&dpr=2&quality=100&sign=41d84e8&sv=2',
        },
        {
          number: 4,
          title: 'Select Polygon (MATIC) Network',
          duration: '1 min',
          content: {
            desc: 'Select the Polygon network where LGNS token operates to create your wallet.',
            steps: [
              'On the wallet main screen, tap the "+" or network icon in the upper right',
              'On the "Select A Network" screen, scroll to find "Polygon (Matic)"',
              'Select "Polygon (Matic)"',
              'If HD Wallet, a Polygon address is automatically generated',
              'If new wallet, Polygon wallet is added with the same mnemonic',
            ],
            tip: 'Polygon is an Ethereum Layer 2 network with fast and cheap transactions.',
          },
          image: 'https://miro.medium.com/v2/resize:fit:1400/1*xphG3lz9BEhB6RUqYW3PqQ.png',
        },
        {
          number: 5,
          title: 'Verify Polygon Address and Receive Tokens',
          duration: '1 min',
          content: {
            desc: 'Verify your generated Polygon wallet address and prepare to receive tokens.',
            steps: [
              'Verify "MATIC" or Polygon network is shown in the Assets tab',
              'Tap the "Receive" button',
              'A QR code and wallet address (starting with 0x) will be displayed',
              'Copy the address or share QR code to receive tokens',
              'When someone sends POL(MATIC) to this address, it will automatically reflect in your balance',
            ],
            tip: 'Using QR code when sharing addresses reduces the chance of errors.',
          },
          image: 'https://www.tokenpocket.pro/_nuxt/img/android-2-en.3a52edb.png',
        },
      ],
      mnemonicWarning: {
        title: 'Mnemonic (Recovery Phrase) Security Rules',
        subtitle: 'If you lose your mnemonic, you permanently lose your wallet',
        dos: [
          'Write it on paper and store in a safe place',
          'Store in multiple locations',
          'Let family know the storage location',
          'Store in a waterproof/fireproof location',
        ],
        donts: [
          'Do not save as screenshot',
          'Do not save to cloud',
          'Do not save in note apps',
          'Do not share with anyone',
          'Do not send via SNS or messages',
        ],
        important: 'Anyone who knows your mnemonic can access all assets in your wallet. Never share it with anyone!',
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          {
            q: 'Is TokenPocket safe?',
            a: 'TokenPocket has been operating since 2018 and is a trusted wallet. Private keys are stored only on your device and are not sent to servers. However, mnemonic management is your responsibility.',
          },
          {
            q: 'What is the difference between POL(MATIC) and Polygon?',
            a: 'Polygon is the network name, and POL (formerly MATIC) is the native token of that network. It is used to pay gas fees.',
          },
          {
            q: 'What if I lose my mnemonic?',
            a: 'Unfortunately, there is no way to recover your wallet if you lose your mnemonic. If you delete the app or lose your device, you permanently lose access to your assets.',
          },
          {
            q: 'How do I add LGNS token?',
            a: 'On the Polygon network, tap the "+" button in the Assets tab and enter the LGNS token contract address (0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01) to add it.',
          },
          {
            q: 'Why do I need POL?',
            a: 'A small amount of POL is used as gas fee for every transaction on the Polygon network. You need POL to transfer or swap LGNS.',
          },
        ],
      },
      nextSteps: {
        title: 'Next Steps',
        items: [
          { title: 'Buy LGNS on QuickSwap', desc: 'How to purchase LGNS token on DEX', link: '/docs/guide/staking' },
          { title: 'Staking Guide', desc: 'Earn rewards by staking LGNS', link: '/docs/guide/staking' },
          { title: 'Using Analysis Page', desc: 'Make investment decisions with real-time data', link: '/analysis' },
        ],
      },
      lgnsContract: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
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
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">TokenPocket</span>
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

          {/* TokenPocket Preview Image */}
          <div className="flex justify-center mb-8">
            <img
              src="https://www.tokenpocket.pro/_nuxt/img/header-img-en.6e698e0.png"
              alt="TokenPocket Wallet"
              className="max-w-full h-auto max-h-[400px] object-contain rounded-xl"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Introduction */}
          <Card className="bg-card border-border/60 mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{t.intro.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t.intro.desc}</p>
              <div className="p-4 rounded-lg bg-secondary/30">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {language === 'ko' ? '준비물' : 'Requirements'}
                </h4>
                <ul className="space-y-1">
                  {t.intro.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-6 mb-8">
            {t.steps.map((step, index) => (
              <Card key={index} className="bg-card border-border/60 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                        {step.number}
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl">{step.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {step.duration}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Content */}
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{step.content.desc}</p>

                      <div className="space-y-2">
                        {step.content.steps.map((s, sIndex) => (
                          <div key={sIndex} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
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
                          className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Google Play Store
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {/* Image */}
                    <div className="flex items-center justify-center p-4 bg-secondary/20 rounded-lg">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="max-w-full h-auto max-h-[350px] object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mnemonic Warning */}
          <Card className="bg-gradient-to-br from-destructive/10 to-orange-500/10 border-destructive/30 mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">{t.mnemonicWarning.title}</CardTitle>
                  <CardDescription className="text-destructive/80">{t.mnemonicWarning.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Dos */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-medium text-green-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {language === 'ko' ? '해야 할 것' : 'Do'}
                  </h4>
                  <ul className="space-y-2">
                    {t.mnemonicWarning.dos.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h4 className="font-medium text-red-500 mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    {language === 'ko' ? '하지 말아야 할 것' : "Don't"}
                  </h4>
                  <ul className="space-y-2">
                    {t.mnemonicWarning.donts.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-destructive/20 border border-destructive/30">
                <p className="text-sm text-center font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  {t.mnemonicWarning.important}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* LGNS Contract Address */}
          <Card className="bg-card border-border/60 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                LGNS Token Contract Address
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? 'Polygon 네트워크에서 LGNS 토큰을 추가할 때 사용하세요' : 'Use this to add LGNS token on Polygon network'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <code className="flex-1 text-sm font-mono break-all">{t.lgnsContract}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(t.lgnsContract)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  {copiedAddress ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {copiedAddress ? t.copied : t.copyAddress}
              </p>
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
                {t.nextSteps.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    className="p-4 rounded-lg bg-background/50 hover:bg-background transition-colors group"
                  >
                    <h4 className="font-medium mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                      {item.title}
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
