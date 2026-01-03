'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Send,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { ForumCategory } from '@/types/forum';

export default function NewPostPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isConfigured } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    content: '',
  });

  const texts = {
    ko: {
      title: '새 글 작성',
      back: '목록으로',
      category: '카테고리',
      selectCategory: '카테고리를 선택하세요',
      postTitle: '제목',
      postTitlePlaceholder: '제목을 입력하세요 (최대 200자)',
      content: '내용',
      contentPlaceholder: '내용을 입력하세요...\n\n# 제목\n## 소제목\n- 목록 항목\n1. 번호 목록',
      submit: '게시하기',
      loading: '로딩 중...',
      loginRequired: '글을 작성하려면 로그인이 필요합니다.',
      login: '로그인',
      error: '오류가 발생했습니다. 다시 시도해주세요.',
      titleRequired: '제목을 입력해주세요.',
      contentRequired: '내용을 입력해주세요.',
      categoryRequired: '카테고리를 선택해주세요.',
      titleTooLong: '제목은 200자 이하로 입력해주세요.',
      success: '게시글이 작성되었습니다.',
      preview: '미리보기',
      markdownHelp: '마크다운 지원: # 제목, ## 소제목, - 목록, 1. 번호목록',
    },
    en: {
      title: 'New Post',
      back: 'Back to list',
      category: 'Category',
      selectCategory: 'Select a category',
      postTitle: 'Title',
      postTitlePlaceholder: 'Enter title (max 200 characters)',
      content: 'Content',
      contentPlaceholder: 'Write your content...\n\n# Heading\n## Subheading\n- List item\n1. Numbered list',
      submit: 'Publish',
      loading: 'Loading...',
      loginRequired: 'You need to login to create a post.',
      login: 'Login',
      error: 'An error occurred. Please try again.',
      titleRequired: 'Please enter a title.',
      contentRequired: 'Please enter content.',
      categoryRequired: 'Please select a category.',
      titleTooLong: 'Title must be 200 characters or less.',
      success: 'Post created successfully.',
      preview: 'Preview',
      markdownHelp: 'Markdown supported: # heading, ## subheading, - list, 1. numbered',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isConfigured && !user) {
      // Redirect to login if not authenticated
      router.push('/auth/login?redirect=/community/forum/new');
    }
  }, [user, isConfigured, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/forum/categories');
      const data = await res.json();
      setCategories(data.categories || []);

      // Auto-select first category
      if (data.categories?.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data.categories[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.category_id) {
      setError(t.categoryRequired);
      return false;
    }
    if (!formData.title.trim()) {
      setError(t.titleRequired);
      return false;
    }
    if (formData.title.length > 200) {
      setError(t.titleTooLong);
      return false;
    }
    if (!formData.content.trim()) {
      setError(t.contentRequired);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t.error);
      }

      // Redirect to the new post
      router.push(`/community/forum/post/${data.post.id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setSubmitting(false);
    }
  };

  // Simple markdown preview renderer
  const renderPreview = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold mt-3 mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-semibold mt-2 mb-1">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-base font-medium mt-2 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc text-sm">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\. /)) {
        return <li key={index} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-sm mb-1">{line}</p>;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">{t.loginRequired}</p>
                <Link href="/auth/login?redirect=/community/forum/new">
                  <Button>{t.login}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/community/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.back}
        </Link>

        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.category}</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-3 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {language === 'ko' ? category.name_ko : category.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.postTitle}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t.postTitlePlaceholder}
                  maxLength={200}
                  className="w-full p-3 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.title.length}/200
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.content}</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t.contentPlaceholder}
                  className="w-full p-3 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono"
                  rows={12}
                />
                <p className="text-xs text-muted-foreground mt-1">{t.markdownHelp}</p>
              </div>

              {/* Preview */}
              {formData.content && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t.preview}</label>
                  <div className="p-4 bg-secondary/30 border border-border rounded-lg min-h-[100px]">
                    {renderPreview(formData.content)}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Link href="/community/forum">
                  <Button type="button" variant="outline">
                    {t.back}
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t.submit}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
