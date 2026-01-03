'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Coins } from 'lucide-react';

const stakingPeriods = [
  { days: 30, apy: 43 },
  { days: 60, apy: 105 },
  { days: 90, apy: 193 },
  { days: 180, apy: 763 },
  { days: 365, apy: 7909 },
];

export function StakingCalculator() {
  const [amount, setAmount] = useState(1000);
  const [selectedPeriod, setSelectedPeriod] = useState(stakingPeriods[2]);

  const calculateRewards = () => {
    const rewards = amount * (selectedPeriod.apy / 100);
    const total = amount + rewards;
    return { rewards, total };
  };

  const { rewards, total } = calculateRewards();

  return (
    <section className="py-20 px-4 bg-card/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">스테이킹</span> 수익 계산기
          </h2>
          <p className="text-lg text-muted-foreground">
            LGNS를 스테이킹하고 보상을 획득하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                스테이킹 설정
              </CardTitle>
              <CardDescription>
                스테이킹할 LGNS 수량과 기간을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>스테이킹 수량</span>
                  <span className="text-muted-foreground">{amount.toLocaleString()} LGNS</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                      ((amount - 100) / (100000 - 100)) * 100
                    }%, #3f3f46 ${((amount - 100) / (100000 - 100)) * 100}%, #3f3f46 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>100,000</span>
                </div>
              </div>

              {/* Period Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  스테이킹 기간
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stakingPeriods.map((period) => (
                    <button
                      key={period.days}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedPeriod.days === period.days
                          ? 'bg-primary text-primary-foreground border-primary neon-glow'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      <div>{period.days}일</div>
                      <div className="text-xs opacity-80">{period.apy}% APY</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                예상 수익
              </CardTitle>
              <CardDescription>
                {selectedPeriod.days}일 스테이킹 시 예상되는 보상
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">스테이킹 수량</div>
                  <div className="text-2xl font-bold">{amount.toLocaleString()} LGNS</div>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-sm text-muted-foreground mb-1">예상 보상</div>
                  <div className="text-3xl font-bold gradient-text">
                    +{rewards.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} LGNS
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedPeriod.apy}% APY
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="text-sm text-muted-foreground mb-1">총 수령액</div>
                  <div className="text-3xl font-bold">
                    {total.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} LGNS
                  </div>
                  <div className="text-sm text-green-500 mt-1">
                    +{((rewards / amount) * 100).toFixed(0)}% 수익
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    복리 수익 포함
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    실시간 업데이트
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * 실제 수익률은 생태계 수요와 사용자 기여도에 따라 조정됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-8 bg-card border-border/60">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">365일</div>
                <div className="text-sm text-muted-foreground">최대 스테이킹 기간</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">7,909%</div>
                <div className="text-sm text-muted-foreground">최대 연간 수익률</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">자동 복리 계산</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
