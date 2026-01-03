'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Pin,
  RefreshCw,
  MessageCircle,
  Megaphone,
  Coins,
  TrendingUp,
  Code,
  HelpCircle,
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const { user } = useAuth();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const texts = {
    ko: {
      back: '포럼으로',
      newPost: '새 글 작성',
      loginToPost: '로그인 후 작성',
      noPosts: '이 카테고리에 게시글이 없습니다.',
      loading: '로딩 중...',
      loadMore: '더 보기',
      pinned: '고정',
      posts: '게시글',
    },
    en: {
      back: 'Back to Forum',
      newPost: 'New Post',
      loginToPost: 'Login to post',
      noPosts: 'No posts in this category.',
      loading: 'Loading...',
      loadMore: 'Load More',
      pinned: 'Pinned',
      posts: 'posts',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, postsRes] = await Promise.all([
        fetch('/api/forum/categories'),
        fetch(`/api/forum/posts?category=${slug}&page=1&limit=20`),
      ]);

      const categoriesData = await categoriesRes.json();
      const postsData = await postsRes.json();

      // Find the category
      const cat = categoriesData.categories?.find((c: ForumCategory) => c.slug === slug);
      setCategory(cat || null);
      setPosts(postsData.posts || []);
      setTotal(postsData.total || 0);
      setHasMore(postsData.hasMore || false);
      setPage(1);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/forum/posts?category=${slug}&page=${nextPage}&limit=20`);
      const data = await res.json();
      setPosts([...posts, ...(data.posts || [])]);
      setHasMore(data.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more posts:', error);
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

  const Icon = category?.icon ? iconMap[category.icon] || MessageCircle : MessageCircle;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/community/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.back}
        </Link>

        {/* Category Header */}
        <Card className="bg-card border-border/60 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-secondary ${category?.color || 'text-primary'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {category ? (language === 'ko' ? category.name_ko : category.name_en) : slug}
                  </h1>
                  {category && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'ko' ? category.description_ko : category.description_en}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {total} {t.posts}
                  </p>
                </div>
              </div>

              {user ? (
                <Link href="/community/forum/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t.newPost}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t.loginToPost}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <Card className="bg-card border-border/60">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">{t.noPosts}</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/forum/post/${post.id}`}
                className="block"
              >
                <Card className="bg-card border-border/60 hover:bg-secondary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {post.is_pinned && (
                            <Badge variant="default" className="text-[12px] h-5 gap-1">
                              <Pin className="h-3 w-3" />
                              {t.pinned}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-sm sm:text-base line-clamp-1 mb-1">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {post.content.replace(/[#*`]/g, '').substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(post.created_at)}
                          </span>
                          <span>{post.author?.display_name || 'Anonymous'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comment_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={loadMore}>
              {t.loadMore}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
