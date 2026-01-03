'use client';

import { ProtectedPage } from '@/hooks/usePagePermission';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vote, Users, FileText, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const proposals = {
  ko: [
    {
      id: 1,
      title: 'DAI 스테이블코인 옵션을 600일 장기 스테이킹 상품에 추가',
      description: '유동성 풀 활성화를 위해 DAI 스테이블코인 구매 옵션 추가',
      status: 'active',
      votes: { for: 85, against: 15 },
      endDate: '2025-01-05',
    },
    {
      id: 2,
      title: 'LGNS 본드 생성 메커니즘 개선',
      description: '재무 안정성 향상을 위한 본드 생성 알고리즘 최적화',
      status: 'active',
      votes: { for: 72, against: 28 },
      endDate: '2025-01-10',
    },
    {
      id: 3,
      title: '크로스체인 브리지 프로토콜 도입',
      description: 'Ethereum, BSC와의 상호운용성 확대',
      status: 'pending',
      votes: { for: 0, against: 0 },
      endDate: '2025-01-15',
    },
  ],
  en: [
    {
      id: 1,
      title: 'Add DAI Stablecoin Option to 600-day Long-term Staking',
      description: 'Add DAI stablecoin purchase option to activate liquidity pool',
      status: 'active',
      votes: { for: 85, against: 15 },
      endDate: '2025-01-05',
    },
    {
      id: 2,
      title: 'Improve LGNS Bond Generation Mechanism',
      description: 'Optimize bond generation algorithm for financial stability',
      status: 'active',
      votes: { for: 72, against: 28 },
      endDate: '2025-01-10',
    },
    {
      id: 3,
      title: 'Introduce Cross-chain Bridge Protocol',
      description: 'Expand interoperability with Ethereum and BSC',
      status: 'pending',
      votes: { for: 0, against: 0 },
      endDate: '2025-01-15',
    },
  ],
};

export default function GovernancePage() {
  const { language } = useLanguage();
  const currentProposals = proposals[language];

  const texts = {
    ko: {
      back: '홈으로',
      title: '탈중앙화 거버넌스',
      subtitle: 'Origin Korea의 미래를 함께 결정하세요. LGNS 보유자라면 누구나 제안하고 투표할 수 있습니다.',
      totalVoters: '총 참여자',
      proposalCount: '제안 수',
      activeVotes: '진행중 투표',
      participation: '참여율',
      activeProposals: '활성 제안',
      voting: '투표 진행중',
      pending: '대기중',
      deadline: '마감',
      voteStatus: '투표 현황',
      votes: '표',
      approve: '찬성',
      reject: '반대',
      voteSoon: '투표가 곧 시작됩니다',
      footer: 'Origin Korea DAO - 커뮤니티가 이끄는 탈중앙화 금융',
    },
    en: {
      back: 'Home',
      title: 'Decentralized Governance',
      subtitle: 'Decide the future of Origin Korea together. Any LGNS holder can propose and vote.',
      totalVoters: 'Total Voters',
      proposalCount: 'Proposals',
      activeVotes: 'Active Votes',
      participation: 'Participation',
      activeProposals: 'Active Proposals',
      voting: 'Voting',
      pending: 'Pending',
      deadline: 'Deadline',
      voteStatus: 'Vote Status',
      votes: 'votes',
      approve: 'Approve',
      reject: 'Reject',
      voteSoon: 'Voting will start soon',
      footer: 'Origin Korea DAO - Community-driven decentralized finance',
    },
  };

  const t = texts[language];

  return (
    <ProtectedPage>
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <Navigation />

      {/* Hero */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 neon-glow mb-4 sm:mb-6">
            <Vote className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">{t.title}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t.totalVoters}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">12,847</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t.proposalCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">147</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Vote className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t.activeVotes}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">2</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t.participation}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">78%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Proposals */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t.activeProposals}</h3>

          <div className="space-y-4 sm:space-y-6">
            {currentProposals.map((proposal) => (
              <Card key={proposal.id} className="bg-card border-border/60">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={proposal.status === 'active' ? 'default' : 'outline'} className="text-xs">
                          {proposal.status === 'active' ? t.voting : t.pending}
                        </Badge>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {t.deadline}: {proposal.endDate}
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg md:text-xl">{proposal.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{proposal.description}</CardDescription>
                </CardHeader>

                <CardContent className="px-4 sm:px-6">
                  {proposal.status === 'active' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{t.voteStatus}</span>
                        <span className="font-medium">
                          {proposal.votes.for + proposal.votes.against} {t.votes}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex-1 h-2 sm:h-3 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${proposal.votes.for}%` }} />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-green-500 min-w-[2.5rem] sm:min-w-[3rem] text-right">
                            {proposal.votes.for}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex-1 h-2 sm:h-3 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${proposal.votes.against}%` }} />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-red-500 min-w-[2.5rem] sm:min-w-[3rem] text-right">
                            {proposal.votes.against}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                        <button
                          type="button"
                          className="flex-1 px-3 sm:px-4 py-2 text-sm bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 font-medium hover:bg-green-500/20 transition-colors"
                        >
                          {t.approve}
                        </button>
                        <button
                          type="button"
                          className="flex-1 px-3 sm:px-4 py-2 text-sm bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 font-medium hover:bg-red-500/20 transition-colors"
                        >
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  )}

                  {proposal.status === 'pending' && (
                    <div className="text-center py-4 text-sm text-muted-foreground">{t.voteSoon}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </ProtectedPage>
  );
}
