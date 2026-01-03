'use client';

import { type ReactNode } from 'react';
import { useWallet, type MembershipTier } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Wallet, Loader2, Star, Shield, Gem, LogIn } from 'lucide-react';
import Link from 'next/link';

interface PremiumFeatureGateProps {
  children: ReactNode;
  requiredTier: MembershipTier;
  featureName?: { ko: string; en: string };
  showPreview?: boolean;
  previewContent?: ReactNode;
}

const TIER_ICONS = {
  none: Lock,
  bronze: Shield,
  silver: Star,
  gold: Crown,
  platinum: Gem,
};

const TIER_COLORS = {
  none: 'text-muted-foreground',
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-400',
};

const TIER_BG_COLORS = {
  none: 'bg-muted/50',
  bronze: 'bg-amber-600/10',
  silver: 'bg-gray-400/10',
  gold: 'bg-yellow-500/10',
  platinum: 'bg-cyan-400/10',
};

const TIER_REQUIREMENTS = {
  none: 0,
  bronze: 100,
  silver: 1000,
  gold: 10000,
  platinum: 100000,
};

export function PremiumFeatureGate({
  children,
  requiredTier,
  featureName,
  showPreview = false,
  previewContent,
}: PremiumFeatureGateProps) {
  const { language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { isConnected, isConnecting, membership, connect, hasAccess } = useWallet();

  const texts = {
    ko: {
      loginRequired: '로그인이 필요합니다',
      loginDescription: '이 기능을 사용하려면 먼저 로그인해주세요.',
      login: '로그인',
      signUp: '가입 신청',
      walletRequired: '지갑 연결 필요',
      walletDescription: 'LGNS 멤버십 혜택을 받으려면 지갑을 연결해주세요.',
      connectWallet: '지갑 연결',
      connecting: '연결 중...',
      upgradeRequired: '업그레이드 필요',
      upgradeDescription: '이 기능은 {tier} 이상 등급에서 이용 가능합니다.',
      currentTier: '현재 등급',
      requiredTier: '필요 등급',
      tokensNeeded: '필요 토큰',
      yourBalance: '현재 보유량',
      viewMembership: '멤버십 보기',
      tierNames: {
        none: '없음',
        bronze: '브론즈',
        silver: '실버',
        gold: '골드',
        platinum: '플래티넘',
      },
    },
    en: {
      loginRequired: 'Login Required',
      loginDescription: 'Please log in to access this feature.',
      login: 'Login',
      signUp: 'Sign Up',
      walletRequired: 'Wallet Connection Required',
      walletDescription: 'Connect your wallet to access LGNS membership benefits.',
      connectWallet: 'Connect Wallet',
      connecting: 'Connecting...',
      upgradeRequired: 'Upgrade Required',
      upgradeDescription: 'This feature is available for {tier} tier and above.',
      currentTier: 'Current Tier',
      requiredTier: 'Required Tier',
      tokensNeeded: 'Tokens Needed',
      yourBalance: 'Your Balance',
      viewMembership: 'View Membership',
      tierNames: {
        none: 'None',
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        platinum: 'Platinum',
      },
    },
  };

  const t = texts[language];
  const TierIcon = TIER_ICONS[requiredTier];
  const tierColor = TIER_COLORS[requiredTier];
  const tierBgColor = TIER_BG_COLORS[requiredTier];

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="p-4 rounded-full bg-secondary/50 w-fit mx-auto mb-4">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">{t.loginRequired}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.loginDescription}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/login">
              <Button>{t.login}</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">{t.signUp}</Button>
            </Link>
          </div>
          {showPreview && previewContent && (
            <div className="mt-6 opacity-50 pointer-events-none blur-sm">
              {previewContent}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No tier required (bronze is minimum for logged-in users)
  if (requiredTier === 'none') {
    return <>{children}</>;
  }

  // Wallet not connected
  if (!isConnected) {
    return (
      <Card className={`border-2 border-dashed ${tierColor.replace('text-', 'border-')}/30`}>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className={`p-4 rounded-full ${tierBgColor} w-fit mx-auto mb-4`}>
            <Wallet className={`h-8 w-8 ${tierColor}`} />
          </div>
          <h3 className="text-lg font-bold mb-2">{t.walletRequired}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.walletDescription}</p>
          {featureName && (
            <Badge className={`${tierBgColor} ${tierColor} mb-4`}>
              <TierIcon className="h-3 w-3 mr-1" />
              {t.tierNames[requiredTier]}+ {language === 'ko' ? '전용' : 'Only'}
            </Badge>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => connect()} disabled={isConnecting} className="gap-2">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.connecting}
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  {t.connectWallet}
                </>
              )}
            </Button>
          </div>
          {showPreview && previewContent && (
            <div className="mt-6 opacity-50 pointer-events-none blur-sm">
              {previewContent}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Check tier access
  if (!hasAccess(requiredTier)) {
    const tokensNeeded = TIER_REQUIREMENTS[requiredTier] - membership.balance;
    const UserTierIcon = TIER_ICONS[membership.tier];

    return (
      <Card className={`border-2 ${tierColor.replace('text-', 'border-')}/30`}>
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className={`p-4 rounded-full ${tierBgColor} w-fit mx-auto mb-4`}>
              <Lock className={`h-8 w-8 ${tierColor}`} />
            </div>
            <h3 className="text-lg font-bold mb-2">{t.upgradeRequired}</h3>
            <p className="text-sm text-muted-foreground">
              {t.upgradeDescription.replace('{tier}', t.tierNames[requiredTier])}
            </p>
          </div>

          {/* Tier comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-xs text-muted-foreground mb-2">{t.currentTier}</p>
              <div className="flex items-center justify-center gap-2">
                <UserTierIcon className={`h-5 w-5 ${TIER_COLORS[membership.tier]}`} />
                <span className={`font-bold ${TIER_COLORS[membership.tier]}`}>
                  {t.tierNames[membership.tier]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {membership.balance.toLocaleString()} LGNS
              </p>
            </div>
            <div className={`p-4 rounded-xl ${tierBgColor} text-center`}>
              <p className="text-xs text-muted-foreground mb-2">{t.requiredTier}</p>
              <div className="flex items-center justify-center gap-2">
                <TierIcon className={`h-5 w-5 ${tierColor}`} />
                <span className={`font-bold ${tierColor}`}>
                  {t.tierNames[requiredTier]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {TIER_REQUIREMENTS[requiredTier].toLocaleString()}+ LGNS
              </p>
            </div>
          </div>

          {/* Tokens needed */}
          {tokensNeeded > 0 && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center mb-4">
              <p className="text-sm">
                {t.tokensNeeded}: <span className="font-bold text-primary">{tokensNeeded.toLocaleString()} LGNS</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/membership">
              <Button className="gap-2">
                <Crown className="h-4 w-4" />
                {t.viewMembership}
              </Button>
            </Link>
          </div>

          {showPreview && previewContent && (
            <div className="mt-6 opacity-30 pointer-events-none blur-md">
              {previewContent}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // User has access
  return <>{children}</>;
}
