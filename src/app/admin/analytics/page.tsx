'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  Clock,
  RefreshCw,
  UserPlus,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Mail,
  PieChart as PieChartIcon,
  TrendingDown,
  Target,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsData {
  users: {
    total: number;
    admins: number;
    regularUsers: number;
    newThisWeek: number;
    newThisMonth: number;
    newToday: number;
  };
  registrations: {
    pending: number;
    approvedThisWeek: number;
    rejectedThisWeek: number;
  };
  recentUsers: {
    id: string;
    email: string;
    display_name?: string;
    is_admin: boolean;
    created_at: string;
  }[];
  userGrowth: {
    date: string;
    count: number;
  }[];
  lastUpdated: string;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: loading } = useAuth();
  const { language } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch analytics data from API
  const fetchAnalytics = async () => {
    setError(null);
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();

      if (data.error && !data.users) {
        setError(data.error);
        return;
      }

      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
  };

  const gaConfigured = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const texts = {
    ko: {
      title: '분석 대시보드',
      subtitle: '실제 사용자 활동 및 통계',
      gaTitle: 'Google Analytics',
      gaSubtitle: '사이트 접속 통계',
      gaConfigured: 'Google Analytics가 설정되었습니다',
      gaNotConfigured: 'Google Analytics가 설정되지 않았습니다',
      gaViewDashboard: 'GA 대시보드 보기',
      gaSetupGuide: '설정 가이드',
      gaNote: 'Vercel 환경변수에 NEXT_PUBLIC_GA_MEASUREMENT_ID를 설정하세요',
      refresh: '새로고침',
      userStats: '사용자 통계',
      totalUsers: '총 사용자',
      admins: '관리자',
      regularUsers: '일반 회원',
      newThisWeek: '이번 주 신규',
      newThisMonth: '이번 달 신규',
      newToday: '오늘 신규',
      registrations: '가입 현황',
      pending: '대기 중',
      approved: '이번 주 승인',
      rejected: '이번 주 거절',
      recentUsers: '최근 가입자',
      userGrowth: '사용자 증가 추이 (7일)',
      noData: '데이터 로딩 중...',
      back: '관리자로 돌아가기',
      lastUpdated: '마지막 업데이트',
      noUsers: '최근 가입자가 없습니다',
      error: '데이터를 불러오는 데 실패했습니다',
      userDistribution: '사용자 구성',
      registrationStats: '가입 통계',
      weeklyComparison: '주간 비교',
      dailyActivity: '일별 활동',
    },
    en: {
      title: 'Analytics Dashboard',
      subtitle: 'Real user activity and statistics',
      gaTitle: 'Google Analytics',
      gaSubtitle: 'Site traffic statistics',
      gaConfigured: 'Google Analytics is configured',
      gaNotConfigured: 'Google Analytics is not configured',
      gaViewDashboard: 'View GA Dashboard',
      gaSetupGuide: 'Setup Guide',
      gaNote: 'Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel environment variables',
      refresh: 'Refresh',
      userStats: 'User Statistics',
      totalUsers: 'Total Users',
      admins: 'Admins',
      regularUsers: 'Regular Users',
      newThisWeek: 'New This Week',
      newThisMonth: 'New This Month',
      newToday: 'New Today',
      registrations: 'Registrations',
      pending: 'Pending',
      approved: 'Approved This Week',
      rejected: 'Rejected This Week',
      recentUsers: 'Recent Users',
      userGrowth: 'User Growth (7 Days)',
      noData: 'Loading data...',
      back: 'Back to Admin',
      lastUpdated: 'Last Updated',
      noUsers: 'No recent users',
      error: 'Failed to load data',
      userDistribution: 'User Distribution',
      registrationStats: 'Registration Stats',
      weeklyComparison: 'Weekly Comparison',
      dailyActivity: 'Daily Activity',
    },
  };

  const t = texts[language];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Colors for charts
  const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

  // Prepare pie chart data
  const getUserDistributionData = () => {
    if (!analytics) return [];
    return [
      { name: t.admins, value: analytics.users.admins, color: '#ef4444' },
      { name: t.regularUsers, value: analytics.users.regularUsers, color: '#3b82f6' },
    ];
  };

  const getRegistrationData = () => {
    if (!analytics) return [];
    return [
      { name: t.pending, value: analytics.registrations.pending, color: '#f59e0b' },
      { name: t.approved, value: analytics.registrations.approvedThisWeek, color: '#22c55e' },
      { name: t.rejected, value: analytics.registrations.rejectedThisWeek, color: '#ef4444' },
    ];
  };

  // Generate comparison data for bar chart
  const getComparisonData = () => {
    if (!analytics) return [];
    return [
      {
        name: language === 'ko' ? '이번 주' : 'This Week',
        users: analytics.users.newThisWeek,
        approved: analytics.registrations.approvedThisWeek,
        rejected: analytics.registrations.rejectedThisWeek,
      },
      {
        name: language === 'ko' ? '이번 달' : 'This Month',
        users: analytics.users.newThisMonth,
        approved: analytics.registrations.approvedThisWeek * 4, // Estimated
        rejected: analytics.registrations.rejectedThisWeek * 4, // Estimated
      },
    ];
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">{t.noData}</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>{t.back}</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t.refresh}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          {/* Last Updated */}
          {analytics?.lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t.lastUpdated}: {formatDate(analytics.lastUpdated)}</span>
            </div>
          )}
        </div>

        {/* Google Analytics Card */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {t.gaTitle}
                    {gaConfigured ? (
                      <Badge className="bg-green-500 text-white text-xs">{language === 'ko' ? '연동됨' : 'Connected'}</Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white text-xs">{language === 'ko' ? '미연동' : 'Not Connected'}</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.gaSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {gaConfigured ? (
                  <a
                    href="https://analytics.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    {t.gaViewDashboard}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>{t.gaNote}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {analytics && (
          <>
            {/* User Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{t.totalUsers}</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.users.total}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{t.admins}</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.users.admins}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{t.regularUsers}</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.users.regularUsers}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-cyan-500 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs">{t.newToday}</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.users.newToday}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="text-xs">{t.newThisWeek}</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.users.newThisWeek}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">{t.newThisMonth}</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.users.newThisMonth}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1: Growth + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* User Growth Chart */}
              <Card className="bg-card border-border/60 lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    {t.userGrowth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.userGrowth}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelFormatter={formatChartDate}
                          formatter={(value) => [value, language === 'ko' ? '신규 가입' : 'New Users']}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fill="url(#colorGrowth)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Distribution Pie Chart */}
              <Card className="bg-card border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-blue-500" />
                    {t.userDistribution}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getUserDistributionData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {getUserDistributionData().map((entry, index) => (
                            <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    {getUserDistributionData().map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2: Registration Stats + Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Registration Stats */}
              <Card className="bg-card border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-amber-500" />
                    {t.registrationStats}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getRegistrationData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getRegistrationData().map((entry, index) => (
                            <Cell key={`reg-cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm">{t.pending}</span>
                      </div>
                      <Badge className="bg-amber-500">{analytics.registrations.pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">{t.approved}</span>
                      </div>
                      <span className="font-medium text-green-500">{analytics.registrations.approvedThisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">{t.rejected}</span>
                      </div>
                      <span className="font-medium text-red-500">{analytics.registrations.rejectedThisWeek}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Comparison Bar Chart */}
              <Card className="bg-card border-border/60 lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    {t.weeklyComparison}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getComparisonData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="users" name={language === 'ko' ? '신규 가입' : 'New Users'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="approved" name={language === 'ko' ? '승인' : 'Approved'} fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="rejected" name={language === 'ko' ? '거절' : 'Rejected'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  {t.recentUsers}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t.noUsers}</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentUsers.map((recentUser) => (
                      <div key={recentUser.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${recentUser.is_admin ? 'bg-red-500/10' : 'bg-secondary'}`}>
                            <Users className={`h-4 w-4 ${recentUser.is_admin ? 'text-red-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {recentUser.display_name || recentUser.email.split('@')[0]}
                              {recentUser.is_admin && (
                                <Badge className="ml-2 bg-red-500/20 text-red-500 text-xs">Admin</Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {recentUser.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(recentUser.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
