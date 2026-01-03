'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Megaphone,
  Coins,
  TrendingUp,
  Code,
  HelpCircle,
  Plus,
  Search,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  ChevronRight,
  Users,
  Pin,
  RefreshCw,
  Flame,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';
import type { ForumCategory, ForumPost } from '@/types/forum';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  Megaphone,
  Coins,
  TrendingUp,
  Code,
  HelpCircle,
};

// Category color schemes - bright and visible
const categoryColors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  general: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-500/40', hover: 'hover:bg-blue-200 dark:hover:bg-blue-500/30' },
  announcements: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-500/40', hover: 'hover:bg-red-200 dark:hover:bg-red-500/30' },
  staking: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-500/40', hover: 'hover:bg-green-200 dark:hover:bg-green-500/30' },
  trading: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-500/40', hover: 'hover:bg-orange-200 dark:hover:bg-orange-500/30' },
  development: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-500/40', hover: 'hover:bg-purple-200 dark:hover:bg-purple-500/30' },
  help: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-500/40', hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-500/30' },
};

export default function ForumPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const texts = {
    ko: {
      title: '커뮤니티 포럼',
      subtitle: 'Origin 커뮤니티와 함께 토론하고 배우세요',
      categories: '카테고리',
      recentPosts: '최근 게시글',
      hotPosts: '인기 게시글',
      newPost: '새 글 작성',
      searchPlaceholder: '게시글 검색...',
      viewAll: '전체 보기',
      noResults: '아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!',
      loading: '로딩 중...',
      posts: '게시글',
      loginToPost: '로그인 후 작성',
      pinned: '고정',
      hot: '인기',
      new: '새글',
      welcome: '환영합니다!',
      welcomeDesc: 'Origin 커뮤니티에서 다양한 주제로 토론하고, 질문하고, 정보를 공유하세요.',
      stats: '커뮤니티 현황',
      totalPosts: '전체 게시글',
      totalMembers: '멤버',
      todayPosts: '오늘 게시글',
    },
    en: {
      title: 'Community Forum',
      subtitle: 'Discuss and learn with the Origin community',
      categories: 'Categories',
      recentPosts: 'Recent Posts',
      hotPosts: 'Hot Posts',
      newPost: 'New Post',
      searchPlaceholder: 'Search posts...',
      viewAll: 'View All',
      noResults: 'No posts yet. Be the first to write!',
      loading: 'Loading...',
      posts: 'posts',
      loginToPost: 'Login to post',
      pinned: 'Pinned',
      hot: 'Hot',
      new: 'New',
      welcome: 'Welcome!',
      welcomeDesc: 'Discuss various topics, ask questions, and share information in the Origin community.',
      stats: 'Community Stats',
      totalPosts: 'Total Posts',
      totalMembers: 'Members',
      todayPosts: 'Today',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, postsRes] = await Promise.all([
        fetch('/api/forum/categories'),
        fetch('/api/forum/posts?limit=10'),
      ]);

      const categoriesData = await categoriesRes.json();
      const postsData = await postsRes.json();

      setCategories(categoriesData.categories || []);
      setRecentPosts(postsData.posts || []);
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return language === 'ko' ? `${days}일 전` : `${days}d ago`;
    }
    if (hours > 0) {
      return language === 'ko' ? `${hours}시간 전` : `${hours}h ago`;
    }
    if (minutes > 0) {
      return language === 'ko' ? `${minutes}분 전` : `${minutes}m ago`;
    }
    return language === 'ko' ? '방금 전' : 'Just now';
  };

  const isNewPost = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours < 24;
  };

  const isHotPost = (post: ForumPost) => {
    return post.like_count >= 5 || post.comment_count >= 3 || post.view_count >= 50;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/community/forum/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getCategoryColor = (slug: string) => {
    return categoryColors[slug] || categoryColors.general;
  };

  const totalPosts = categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero Header */}
        <div className="relative mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-card dark:from-primary/20 dark:via-primary/10 dark:to-transparent border border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">{t.subtitle}</p>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <Link href="/community/forum/new">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                      <Plus className="h-5 w-5" />
                      {t.newPost}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="outline" size="lg" className="gap-2">
                      <Plus className="h-5 w-5" />
                      {t.loginToPost}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-primary/20">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <span className="font-bold text-primary">{totalPosts}</span> {t.totalPosts}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  <span className="font-bold text-green-500">2,847</span> {t.totalMembers}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  <span className="font-bold text-orange-500">{recentPosts.filter(p => isNewPost(p.created_at)).length}</span> {t.todayPosts}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t.categories}
              </h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon] || MessageCircle;
                  const colors = getCategoryColor(category.slug);
                  return (
                    <Link
                      key={category.id}
                      href={`/community/forum/category/${category.slug}`}
                      className="block"
                    >
                      <Card className={`border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {language === 'ko' ? category.name_ko : category.name_en}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {category.post_count || 0} {t.posts}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Posts - Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {t.recentPosts}
              </h2>
              <Link href="/community/forum/all" className="text-sm text-primary hover:underline flex items-center gap-1">
                {t.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentPosts.length === 0 ? (
                <Card className="bg-card border-border/60">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground">{t.noResults}</p>
                    {user && (
                      <Link href="/community/forum/new">
                        <Button className="mt-4 gap-2">
                          <Plus className="h-4 w-4" />
                          {t.newPost}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                recentPosts.map((post) => {
                  const categorySlug = post.category?.slug || 'general';
                  const colors = getCategoryColor(categorySlug);
                  return (
                    <Link
                      key={post.id}
                      href={`/community/forum/post/${post.id}`}
                      className="block group"
                    >
                      <Card className="bg-card border-border/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Author Avatar */}
                            <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Badges */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {post.is_pinned && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[12px] h-5 gap-1">
                                    <Pin className="h-3 w-3" />
                                    {t.pinned}
                                  </Badge>
                                )}
                                {isHotPost(post) && !post.is_pinned && (
                                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[12px] h-5 gap-1">
                                    <Flame className="h-3 w-3" />
                                    {t.hot}
                                  </Badge>
                                )}
                                {isNewPost(post.created_at) && !post.is_pinned && !isHotPost(post) && (
                                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[12px] h-5 gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    {t.new}
                                  </Badge>
                                )}
                                {post.category && (
                                  <Badge variant="outline" className={`text-[12px] h-5 ${colors.text} ${colors.border}`}>
                                    {language === 'ko' ? post.category.name_ko : post.category.name_en}
                                  </Badge>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-sm sm:text-base line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>

                              {/* Content Preview */}
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                                {post.content.replace(/[#*`]/g, '').substring(0, 150)}...
                              </p>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <User className="h-3 w-3" />
                                  {post.author?.display_name || 'Anonymous'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(post.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground flex-shrink-0">
                              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50">
                                <Eye className="h-3 w-3" />
                                {post.view_count}
                              </span>
                              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50">
                                <Heart className="h-3 w-3" />
                                {post.like_count}
                              </span>
                              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50">
                                <MessageSquare className="h-3 w-3" />
                                {post.comment_count}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
