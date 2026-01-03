'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookmarkCheck, Plus, Pencil, Trash2, X, Save, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { type Bookmark, defaultBookmarks, getBookmarks, saveBookmarks, getCategories } from '@/data/bookmarks';

export default function AdminBookmarksPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: loading } = useAuth();
  const { language } = useLanguage();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    name_ko: '',
    name_en: '',
    url: '',
  });



  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    // Load bookmarks from shared data source
    const loadedBookmarks = getBookmarks();
    setBookmarks(loadedBookmarks);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      saveBookmarks(bookmarks);
    }
  }, [bookmarks]);

  const categories = getCategories(bookmarks);

  const handleResetToDefault = () => {
    if (confirm(language === 'ko' ? '모든 북마크를 기본값으로 초기화하시겠습니까?' : 'Reset all bookmarks to default?')) {
      setBookmarks(defaultBookmarks);
      saveBookmarks(defaultBookmarks);
    }
  };

  const filteredBookmarks = selectedCategory
    ? bookmarks.filter(b => b.category === selectedCategory)
    : bookmarks;

  const handleAddBookmark = () => {
    if (!formData.category || !formData.name_ko || !formData.url) return;

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      category: formData.category,
      name_ko: formData.name_ko,
      name_en: formData.name_en || formData.name_ko,
      url: formData.url,
      order: bookmarks.filter(b => b.category === formData.category).length + 1,
    };

    setBookmarks([...bookmarks, newBookmark]);
    setFormData({ category: '', name_ko: '', name_en: '', url: '' });
    setIsAddModalOpen(false);
  };

  const handleEditBookmark = () => {
    if (!editingBookmark) return;

    setBookmarks(bookmarks.map(b =>
      b.id === editingBookmark.id
        ? { ...editingBookmark, ...formData }
        : b
    ));
    setEditingBookmark(null);
    setFormData({ category: '', name_ko: '', name_en: '', url: '' });
  };

  const handleDeleteBookmark = (id: string) => {
    if (confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setBookmarks(bookmarks.filter(b => b.id !== id));
    }
  };

  const openEditModal = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({
      category: bookmark.category,
      name_ko: bookmark.name_ko,
      name_en: bookmark.name_en,
      url: bookmark.url,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="border-b border-border/40 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {language === 'ko' ? '대시보드로' : 'Back to Dashboard'}
            </Link>
            <h1 className="text-2xl font-bold gradient-text">
              {language === 'ko' ? '북마크 관리' : 'Manage Bookmarks'}
            </h1>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Badge variant="outline">Admin</Badge>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <BookmarkCheck className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  {language === 'ko' ? '북마크 관리' : 'Bookmark Management'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'ko'
                    ? `총 ${bookmarks.length}개 북마크`
                    : `Total ${bookmarks.length} bookmarks`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {language === 'ko' ? '북마크 추가' : 'Add Bookmark'}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {language === 'ko' ? '전체' : 'All'} ({bookmarks.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {cat} ({bookmarks.filter(b => b.category === cat).length})
              </button>
            ))}
          </div>

          {/* Bookmarks List */}
          <div className="space-y-3">
            {filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="bg-card border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{bookmark.category}</Badge>
                      </div>
                      <h4 className="font-medium truncate">{bookmark.name_ko}</h4>
                      <p className="text-sm text-muted-foreground truncate">{bookmark.name_en}</p>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        {bookmark.url.substring(0, 50)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => openEditModal(bookmark)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title={language === 'ko' ? '수정' : 'Edit'}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title={language === 'ko' ? '삭제' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBookmarks.length === 0 && (
            <Card className="bg-card border-border/60">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {language === 'ko' ? '북마크가 없습니다.' : 'No bookmarks found.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingBookmark) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingBookmark
                    ? (language === 'ko' ? '북마크 수정' : 'Edit Bookmark')
                    : (language === 'ko' ? '북마크 추가' : 'Add Bookmark')}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBookmark(null);
                    setFormData({ category: '', name_ko: '', name_en: '', url: '' });
                  }}
                  className="p-1 hover:bg-secondary rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    {language === 'ko' ? '카테고리' : 'Category'} *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Origin Official"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {language === 'ko' ? '이름 (한국어)' : 'Name (Korean)'} *
                  </label>
                  <input
                    type="text"
                    value={formData.name_ko}
                    onChange={(e) => setFormData({ ...formData, name_ko: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {language === 'ko' ? '이름 (영어)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL *</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://"
                  />
                </div>
                <button
                  type="button"
                  onClick={editingBookmark ? handleEditBookmark : handleAddBookmark}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingBookmark
                    ? (language === 'ko' ? '저장' : 'Save')
                    : (language === 'ko' ? '추가' : 'Add')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="border-t border-border/40 py-8 px-4 mt-20 relative z-10">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>{language === 'ko' ? '북마크 관리 페이지' : 'Bookmark Management'}</p>
        </div>
      </footer>
    </div>
  );
}
