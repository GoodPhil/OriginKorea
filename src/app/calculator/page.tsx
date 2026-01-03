'use client';

import { ProtectedPage } from '@/hooks/usePagePermission';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Coins, Calculator, RefreshCw, Zap, Clock, DollarSign, ChevronDown, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { InvestmentCalculator } from '@/components/InvestmentCalculator';
import { StakingInfo } from '@/components/StakingInfo';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useExchangeRate, formatKRW } from '@/hooks/useExchangeRate';

// Staking packages - simplified without period bonuses (matching current LGNS DeFi system)
const stakingPackages = [
  { days: 30, baseAPY: 0.20, name: { ko: '단기', en: 'Short' }, color: 'bg-blue-500' },
  { days: 90, baseAPY: 0.20, name: { ko: '스탠다드', en: 'Standard' }, color: 'bg-green-500' },
  { days: 180, baseAPY: 0.20, name: { ko: '프리미엄', en: 'Premium' }, color: 'bg-purple-500' },
  { days: 365, baseAPY: 0.20, name: { ko: '연간', en: 'Annual' }, color: 'bg-orange-500' },
  { days: 600, baseAPY: 0.20, name: { ko: '장기', en: 'Long-term' }, color: 'bg-red-500' },
];

// Quick amount presets
const quickAmounts = [1000, 5000, 10000, 50000, 100000];

export default function CalculatorPage() {
  const { language } = useLanguage();
  const { rate: exchangeRate, loading: rateLoading } = useExchangeRate();

  // LGNS price in USD
  const lgnsPrice = 6.56;

  const texts = {
    ko: {
      back: '홈으로',
      title: '스테이킹',
      heroTitle: '스테이킹',
      heroSubtitle: '복리 수익을 정확하게 계산하고 최적의 스테이킹 전략을 수립하세요',
      stakingPackages: '스테이킹 패키지',
      stakingPackagesDesc: '기간별 최적화된 스테이킹 옵션을 선택하세요',
      selectPackage: '패키지 선택',
      custom: '커스텀',
      daiAvailable: 'DAI 옵션',
      stakingSettings: '스테이킹 설정',
      stakingSettingsDesc: '스테이킹할 LGNS 수량과 기간을 설정하세요',
      quickSelect: '빠른 선택',
      stakingAmount: '스테이킹 수량 (LGNS)',
      directInput: '직접 입력',
      min: '최소',
      max: '최대',
      stakingPeriod: '스테이킹 기간 (일)',
      days: '일',
      enterDays: '일 수 입력',

      yieldSettings: '수익률 설정',
      yieldSettingsDesc: '8시간당 복리 수익률을 설정하세요',
      autoYield: '기본 수익률',
      per8Hours: '8시간당',
      manualSetting: '수동 설정',
      directYieldInput: '직접 수익률 입력',
      auto: '기본값',
      manual: '수동',
      yieldPer8Hours: '8시간당 수익률 (%)',
      enterYield: '수익률 입력 (예: 0.2)',
      dailyYield: '일일 수익률',
      compoundCount: '복리 횟수',
      times: '회',
      totalPeriodAPY: '총 기간 APY',
      expectedRewards: '예상 수익',
      expectedRewardsDesc: '일간 복리 스테이킹 예상 결과',
      stakingAmountLabel: '스테이킹 수량',
      expectedReward: '예상 보상',
      totalCompound: '총 복리 적용',
      totalReceive: '총 수령액',
      totalYield: '총 수익률',
      compoundMethod: '복리 계산 방식',
      every8Hours: '8시간마다',
      dailyCompoundCount: '1일 복리 횟수',
      totalCompoundCount: '총 복리 횟수',
      avgDailyReward: '평균 일일 수익',
      compound8Hours: '8시간 복리',
      realtimeCalc: '실시간 계산',
      accurateSim: '정확한 시뮬레이션',
      note: '8시간마다 수익률의 복리가 적용됩니다. 실제 수익률은 시장 상황에 따라 변동될 수 있습니다.',
      comparison: '패키지 비교',
      comparisonDesc: '각 패키지별 예상 수익 비교',
      package: '패키지',
      period: '기간',
      yieldRate: '8시간당 수익률',
      totalAPY: '총 수익률',
      expectedReturn: '예상 수익',
      compoundFormula: '복리 계산 공식',
      compoundFormulaDesc: '정확한 수익 예측을 위한 복리 계산 방법',
      finalAmount: '최종 금액 = 원금 × (1 + 수익률)^복리횟수',
      calcExample: '계산 예시',
      principal: '원금',
      yieldPer8HoursLabel: '8시간당 수익률',
      compoundTimes: '복리 횟수',
      result: '결과',
      totalReward: '총 수익',
      finalAmountLabel: '최종 금액',
      totalYieldLabel: '총 수익률',
      avgDaily: '일평균 수익',
      compoundPeriod: '복리 주기',
      yieldLabel: '수익률',
      footer: 'Origin 스테이킹 계산기 - 정확한 복리 수익 시뮬레이션',
      daiOption: 'DAI 스테이블코인 옵션',
      daiOptionDesc: '600일 장기 스테이킹 시 DAI로 보상 수령 가능',
      lgnsReward: 'LGNS 보상',
      daiReward: 'DAI 보상',
      selectRewardType: '보상 유형 선택',
      yieldModeAuto: '기본값 사용 (0.2%)',
      yieldModeManual: '수동 입력',
    },
    en: {
      back: 'Home',
      title: 'Staking Calculator',
      heroTitle: 'Staking Rewards Calculator',
      heroSubtitle: 'Calculate compound interest accurately and develop optimal staking strategies',
      stakingPackages: 'Staking Packages',
      stakingPackagesDesc: 'Select optimized staking options by period',
      selectPackage: 'Select Package',
      custom: 'Custom',
      daiAvailable: 'DAI Option',
      stakingSettings: 'Staking Settings',
      stakingSettingsDesc: 'Set the LGNS amount and staking period',
      quickSelect: 'Quick Select',
      stakingAmount: 'Staking Amount (LGNS)',
      directInput: 'Direct input',
      min: 'Min',
      max: 'Max',
      stakingPeriod: 'Staking Period (days)',
      days: 'days',
      enterDays: 'Enter days',

      yieldSettings: 'Yield Settings',
      yieldSettingsDesc: 'Set the compound yield per 8 hours',
      autoYield: 'Default Yield',
      per8Hours: 'Per 8 hours',
      manualSetting: 'Manual Setting',
      directYieldInput: 'Enter yield manually',
      auto: 'Default',
      manual: 'Manual',
      yieldPer8Hours: 'Yield per 8 hours (%)',
      enterYield: 'Enter yield (e.g., 0.2)',
      dailyYield: 'Daily Yield',
      compoundCount: 'Compound Count',
      times: 'times',
      totalPeriodAPY: 'Total Period APY',
      expectedRewards: 'Expected Rewards',
      expectedRewardsDesc: 'Expected compound staking results for days',
      stakingAmountLabel: 'Staking Amount',
      expectedReward: 'Expected Reward',
      totalCompound: 'Total compounds applied',
      totalReceive: 'Total to Receive',
      totalYield: 'Total Yield',
      compoundMethod: 'Compound Method',
      every8Hours: 'Every 8 hours',
      dailyCompoundCount: 'Daily Compound Count',
      totalCompoundCount: 'Total Compound Count',
      avgDailyReward: 'Avg Daily Reward',
      compound8Hours: '8-hour Compound',
      realtimeCalc: 'Real-time Calc',
      accurateSim: 'Accurate Simulation',
      note: 'Compound interest is applied every 8 hours. Actual yields may vary depending on market conditions.',
      comparison: 'Package Comparison',
      comparisonDesc: 'Compare expected returns for each package',
      package: 'Package',
      period: 'Period',
      yieldRate: 'Yield per 8h',
      totalAPY: 'Total Yield',
      expectedReturn: 'Expected Return',
      compoundFormula: 'Compound Formula',
      compoundFormulaDesc: 'Compound calculation method for accurate yield prediction',
      finalAmount: 'Final Amount = Principal × (1 + Rate)^Compounds',
      calcExample: 'Calculation Example',
      principal: 'Principal',
      yieldPer8HoursLabel: 'Yield per 8h',
      compoundTimes: 'Compound Count',
      result: 'Result',
      totalReward: 'Total Reward',
      finalAmountLabel: 'Final Amount',
      totalYieldLabel: 'Total Yield',
      avgDaily: 'Avg Daily',
      compoundPeriod: 'Compound Period',
      yieldLabel: 'Yield',
      footer: 'Origin Staking Calculator - Accurate compound interest simulation',
      daiOption: 'DAI Stablecoin Option',
      daiOptionDesc: 'Receive rewards in DAI for 600-day long-term staking',
      lgnsReward: 'LGNS Reward',
      daiReward: 'DAI Reward',
      selectRewardType: 'Select Reward Type',
      yieldModeAuto: 'Use default (0.2%)',
      yieldModeManual: 'Manual input',
    },
  };

  const t = texts[language];

  // State
  const [stakingAmount, setStakingAmount] = useState(10000);
  const [stakingDays, setStakingDays] = useState(90);
  const [apyPer8Hours, setApyPer8Hours] = useState(0.2); // Default 0.2% per 8 hours
  const [manualAPY, setManualAPY] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(1);


  // Calculate compound interest
  const calculateRewards = () => {
    const effectiveAPY = apyPer8Hours / 100; // Convert percentage to decimal
    const compoundPeriods = stakingDays * 3; // 3 times per day (every 8 hours)
    const finalAmount = stakingAmount * Math.pow(1 + effectiveAPY, compoundPeriods);
    const rewards = finalAmount - stakingAmount;
    const totalAPY = ((finalAmount / stakingAmount - 1) * 100);
    const dailyRate = apyPer8Hours * 3; // 3 compounds per day
    return { rewards, finalAmount, totalAPY, dailyRate, effectiveAPY: apyPer8Hours };
  };

  const { rewards, finalAmount, totalAPY, dailyRate, effectiveAPY } = calculateRewards();

  // Calculate rewards for comparison table
  const calculatePackageRewards = (pkg: typeof stakingPackages[0]) => {
    const effectiveAPY = apyPer8Hours / 100;
    const compoundPeriods = pkg.days * 3;
    const finalAmount = stakingAmount * Math.pow(1 + effectiveAPY, compoundPeriods);
    const rewards = finalAmount - stakingAmount;
    const totalAPY = ((finalAmount / stakingAmount - 1) * 100);
    return { rewards, finalAmount, totalAPY };
  };

  const handleAmountChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setStakingAmount(Math.max(0, num));
  };

  const handleDaysChange = (value: string) => {
    const num = parseInt(value) || 0;
    setStakingDays(Math.max(1, Math.min(600, num)));
  };

  const handleAPYChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setApyPer8Hours(Math.max(0, Math.min(10, num))); // Max 10% per 8 hours
  };

  const selectPackage = (index: number) => {
    setSelectedPackage(index);
    setStakingDays(stakingPackages[index].days);
  };

  const toggleManualAPY = () => {
    setManualAPY(!manualAPY);
    if (!manualAPY) {
      // Switching to manual - keep current value
    } else {
      // Switching to auto - reset to default
      setApyPer8Hours(0.2);
    }
  };

  return (
    <ProtectedPage>
    <div className="min-h-screen gradient-bg">
      <Navigation />

      {/* Hero */}
      <section className="py-12 sm:py-16 md:py-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 neon-glow mb-4 sm:mb-6">
            <Calculator className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">{t.heroTitle}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* 1. Staking Info from Smart Contract - 스마트 컨트랙트 데이터 (FIRST) */}
      <section className="py-8 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <StakingInfo />
        </div>
      </section>

      {/* 2. Staking Rewards Calculator - 스테이킹 수익 계산기 */}
      {/* Staking Packages */}
      <section className="py-6 sm:py-8 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {t.stakingPackages}
              </CardTitle>
              <CardDescription>{t.stakingPackagesDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {stakingPackages.map((pkg, index) => (
                  <button
                    key={pkg.days}
                    type="button"
                    onClick={() => selectPackage(index)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      selectedPackage === index
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : 'border-border/40 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${pkg.color} mx-auto mb-2`} />
                    <div className="font-bold text-lg">{pkg.days}{language === 'ko' ? '일' : 'd'}</div>
                    <div className="text-xs text-muted-foreground mb-2">{pkg.name[language]}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-8 sm:py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Settings */}
            <div className="space-y-6">
              {/* Staking Amount & Period */}
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    {t.stakingSettings}
                  </CardTitle>
                  <CardDescription>{t.stakingSettingsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Select Buttons */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.quickSelect}</label>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setStakingAmount(amount)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            stakingAmount === amount
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          {amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>{t.stakingAmount}</span>
                      <span className="text-primary">{stakingAmount.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="1000000"
                      step="100"
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((stakingAmount - 100) / (1000000 - 100)) * 100}%, #3f3f46 ${((stakingAmount - 100) / (1000000 - 100)) * 100}%, #3f3f46 100%)`,
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={stakingAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t.directInput}
                      />
                      <span className="text-sm text-muted-foreground">LGNS</span>
                    </div>
                  </div>

                  {/* Days Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t.stakingPeriod}
                      </span>
                      <span className="text-primary">{stakingDays}{t.days}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="600"
                      value={stakingDays}
                      onChange={(e) => { setStakingDays(Number(e.target.value)); setSelectedPackage(null); }}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((stakingDays - 1) / (600 - 1)) * 100}%, #3f3f46 ${((stakingDays - 1) / (600 - 1)) * 100}%, #3f3f46 100%)`,
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={stakingDays}
                        onChange={(e) => { handleDaysChange(e.target.value); setSelectedPackage(null); }}
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t.enterDays}
                      />
                      <span className="text-sm text-muted-foreground">{t.days}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yield Settings - NEW SECTION FOR MANUAL INPUT */}
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    {t.yieldSettings}
                  </CardTitle>
                  <CardDescription>{t.yieldSettingsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Auto/Manual Toggle */}
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{manualAPY ? t.manualSetting : t.autoYield}</div>
                      <div className="text-xs text-muted-foreground">
                        {manualAPY ? t.directYieldInput : `${t.per8Hours}: 0.2%`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleManualAPY}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        manualAPY
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {manualAPY ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {manualAPY ? t.manual : t.auto}
                    </button>
                  </div>

                  {/* Manual APY Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>{t.yieldPer8Hours}</span>
                      <span className="text-primary font-bold">{apyPer8Hours.toFixed(4)}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.0001"
                        value={apyPer8Hours}
                        onChange={(e) => {
                          handleAPYChange(e.target.value);
                          setManualAPY(true);
                        }}
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t.enterYield}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    {/* Quick preset buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[0.15, 0.18, 0.20, 0.22, 0.25].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => { setApyPer8Hours(rate); setManualAPY(true); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            apyPer8Hours === rate
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yield Summary */}
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t.per8Hours}</span>
                        <div className="font-bold text-primary">{apyPer8Hours.toFixed(4)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.dailyYield}</span>
                        <div className="font-bold text-primary">{(apyPer8Hours * 3).toFixed(4)}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Results */}
            <div className="space-y-6">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t.expectedRewards}
                  </CardTitle>
                  <CardDescription>{stakingDays}{t.days} {t.expectedRewardsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Exchange Rate Indicator for Korean */}
                    {language === 'ko' && (
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        {rateLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <span>1 USD = ₩{exchangeRate.toLocaleString('ko-KR')} | LGNS = ${lgnsPrice}</span>
                        )}
                      </div>
                    )}

                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t.stakingAmountLabel}</div>
                      <div className="text-2xl font-bold">{stakingAmount.toLocaleString()} LGNS</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-green-500">
                          ${(stakingAmount * lgnsPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm text-muted-foreground">|</span>
                        <span className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                          {formatKRW(stakingAmount * lgnsPrice, exchangeRate)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="text-sm text-muted-foreground mb-1">{t.expectedReward}</div>
                      <div className="text-3xl font-bold gradient-text">
                        +{rewards.toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-green-500">
                          +${(rewards * lgnsPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm text-muted-foreground">|</span>
                        <span className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                          +{formatKRW(rewards * lgnsPrice, exchangeRate)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {t.totalCompound} {stakingDays * 3}{t.times}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                      <div className="text-sm text-muted-foreground mb-1">{t.totalReceive}</div>
                      <div className="text-3xl font-bold">
                        {finalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-green-500">
                          ${(finalAmount * lgnsPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm text-muted-foreground">|</span>
                        <span className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                          {formatKRW(finalAmount * lgnsPrice, exchangeRate)}
                        </span>
                      </div>
                      <div className="text-sm text-green-500 mt-2">
                        +{totalAPY.toFixed(2)}% {t.totalYield}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.per8Hours}</span>
                        <span className="font-medium text-primary">{effectiveAPY.toFixed(4)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.dailyYield}</span>
                        <span className="font-medium text-primary">{dailyRate.toFixed(4)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.totalCompoundCount}</span>
                        <span className="font-medium">{stakingDays * 3}{t.times}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.avgDailyReward}</span>
                        <span className="font-medium text-primary">
                          +{(rewards / stakingDays).toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{t.compound8Hours}</Badge>
                      <Badge variant="outline" className="text-xs">{t.realtimeCalc}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">* {t.note}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card border-border/60">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold gradient-text mb-2">8h</div>
                      <div className="text-xs text-muted-foreground">{t.compoundPeriod}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold gradient-text mb-2">{effectiveAPY.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">{t.yieldLabel}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold gradient-text mb-2">{dailyRate.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">{t.dailyYield}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Package Comparison Table - Simplified without bonuses */}
      <section className="py-12 px-4 bg-card/20 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-card border-border/60 overflow-hidden">
            <CardHeader>
              <CardTitle>{t.comparison}</CardTitle>
              <CardDescription>{t.comparisonDesc} ({stakingAmount.toLocaleString()} LGNS @ {apyPer8Hours}%/{language === 'ko' ? '8시간' : '8h'})</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">{t.package}</th>
                      <th className="px-4 py-3 text-center font-medium">{t.period}</th>
                      <th className="px-4 py-3 text-center font-medium">{t.yieldRate}</th>
                      <th className="px-4 py-3 text-center font-medium">{t.totalAPY}</th>
                      <th className="px-4 py-3 text-right font-medium">{t.expectedReturn}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakingPackages.map((pkg, index) => {
                      const pkgRewards = calculatePackageRewards(pkg);
                      return (
                        <tr
                          key={pkg.days}
                          className={`border-t border-border/40 hover:bg-secondary/30 cursor-pointer transition-colors ${
                            selectedPackage === index ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => selectPackage(index)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${pkg.color}`} />
                              <span className="font-medium">{pkg.name[language]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{pkg.days}{language === 'ko' ? '일' : 'd'}</td>
                          <td className="px-4 py-3 text-center text-primary">{apyPer8Hours}%</td>
                          <td className="px-4 py-3 text-center font-medium text-green-500">
                            +{pkgRewards.totalAPY.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            <div className="text-primary">+{pkgRewards.rewards.toLocaleString('en-US', { maximumFractionDigits: 0 })} LGNS</div>
                            <div className="text-xs text-cyan-500">{formatKRW(pkgRewards.rewards * lgnsPrice, exchangeRate)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Investment ROI Calculator - 투자 수익률 계산기 */}
      <section className="py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <InvestmentCalculator />
        </div>
      </section>

      <Footer />
    </div>
    </ProtectedPage>
  );
}
