'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Pin,
  Lock,
  Share2,
  Bookmark,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  User,
  MoreHorizontal,
} from 'lucide-react';
import type { ForumPost, ForumComment } from '@/types/forum';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost & { comments?: ForumComment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const texts = {
    ko: {
      loading: '로딩 중...',
      error: '게시글을 불러오는데 실패했습니다.',
      back: '목록으로',
      pinned: '고정됨',
      locked: '잠금',
      comments: '댓글',
      writeComment: '댓글을 작성하세요...',
      submit: '등록',
      loginToComment: '댓글을 작성하려면 로그인하세요',
      noComments: '아직 댓글이 없습니다. 첫 댓글을 작성해보세요!',
      share: '공유',
      bookmark: '북마크',
      edit: '수정',
      delete: '삭제',
      confirmDelete: '정말 삭제하시겠습니까?',
      deleted: '삭제되었습니다.',
      views: '조회',
      likes: '좋아요',
    },
    en: {
      loading: 'Loading...',
      error: 'Failed to load post.',
      back: 'Back to list',
      pinned: 'Pinned',
      locked: 'Locked',
      comments: 'Comments',
      writeComment: 'Write a comment...',
      submit: 'Submit',
      loginToComment: 'Login to comment',
      noComments: 'No comments yet. Be the first to comment!',
      share: 'Share',
      bookmark: 'Bookmark',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete?',
      deleted: 'Deleted successfully.',
      views: 'Views',
      likes: 'Likes',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forum/posts/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch post');
      }

      setPost(data.post);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeDate = (dateString: string) => {
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: id,
          content: commentContent.trim(),
        }),
      });

      if (res.ok) {
        setCommentContent('');
        fetchPost(); // Refresh to get new comment
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert(language === 'ko' ? '링크가 복사되었습니다.' : 'Link copied to clipboard.');
    } catch {
      // Fallback for browsers without clipboard API
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const res = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert(t.deleted);
        router.push('/community/forum');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mt-2 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\. /)) {
        return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || t.error}</p>
              <Link href="/community/forum">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.back}
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAuthor = user && post.author_id === user.id;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/community/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.back}
        </Link>

        {/* Post Card */}
        <Card className="bg-card border-border/60 mb-6">
          <CardContent className="p-4 sm:p-6">
            {/* Post Header */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {post.is_pinned && (
                <Badge variant="default" className="gap-1">
                  <Pin className="h-3 w-3" />
                  {t.pinned}
                </Badge>
              )}
              {post.is_locked && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  {t.locked}
                </Badge>
              )}
              {post.category && (
                <Badge variant="outline">
                  {language === 'ko' ? post.category.name_ko : post.category.name_en}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{post.title}</h1>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{post.author?.display_name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {post.like_count}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              {renderContent(post.content)}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Heart className="h-4 w-4" />
                  {post.like_count}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>

              {isAuthor && (
                <div className="flex items-center gap-2">
                  <Link href={`/community/forum/edit/${post.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      {t.edit}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                    {t.delete}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-card border-border/60">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t.comments} ({post.comments?.length || 0})
            </h2>

            {/* Comment Form */}
            {user ? (
              !post.is_locked && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={t.writeComment}
                    className="w-full p-3 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" disabled={submitting || !commentContent.trim()} className="gap-2">
                      {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {t.submit}
                    </Button>
                  </div>
                </form>
              )
            ) : (
              <div className="mb-6 p-4 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">{t.loginToComment}</p>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{comment.author?.display_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Heart className="h-3 w-3" />
                        {comment.like_count}
                      </Button>
                    </div>
                    <p className="text-sm pl-10">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">{t.noComments}</p>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
