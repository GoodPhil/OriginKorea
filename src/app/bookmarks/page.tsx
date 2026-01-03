'use client';

import { ProtectedPage } from '@/hooks/usePagePermission';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookmarkCheck, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { getBookmarks, getCategories } from '@/data/bookmarks';

interface CategoryGroup {
  title: { ko: string; en: string };
  links: { name: { ko: string; en: string }; url: string }[];
}

const categoryTranslations: Record<string, { ko: string; en: string }> = {
  'Origin Official': { ko: '오리진 공식', en: 'Origin Official' },
  'X (Twitter)': { ko: 'X (Twitter)', en: 'X (Twitter)' },
  'Scale Information': { ko: '스케일 정보', en: 'Scale Information' },
  'Audit': { ko: '감사 (Audit)', en: 'Audit' },
  'Info': { ko: '정보 (Info)', en: 'Info' },
  'Manual': { ko: '매뉴얼', en: 'Manual' },
  'Topic & Issue': { ko: '주제 & 이슈', en: 'Topic & Issue' },
  'News': { ko: '뉴스', en: 'News' },
  'Defi Comparison': { ko: 'DeFi 비교', en: 'DeFi Comparison' },
  'Other': { ko: '기타', en: 'Other' },
};

export default function BookmarksPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarkCategories, setBookmarkCategories] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bookmarks = getBookmarks();
    const categories = getCategories(bookmarks);

    const grouped: CategoryGroup[] = categories.map(category => {
      const categoryBookmarks = bookmarks
        .filter(b => b.category === category)
        .sort((a, b) => a.order - b.order);

      const translatedTitle = categoryTranslations[category] || { ko: category, en: category };

      return {
        title: translatedTitle,
        links: categoryBookmarks.map(b => ({
          name: { ko: b.name_ko, en: b.name_en },
          url: b.url,
        })),
      };
    });

    setBookmarkCategories(grouped);
    setIsLoading(false);
  }, []);

  const filteredCategories = bookmarkCategories
    .map(category => {
      const filteredLinks = category.links.filter(link => {
        const linkName = link.name[language];
        const searchLower = searchQuery.toLowerCase();
        return linkName.toLowerCase().includes(searchLower) || link.url.toLowerCase().includes(searchLower);
      });
      return { ...category, links: filteredLinks };
    })
    .filter(category => {
      if (selectedCategory) return category.title[language] === selectedCategory;
      return category.links.length > 0;
    });

  const totalLinks = filteredCategories.reduce((acc, cat) => acc + cat.links.length, 0);
  const allCategoryNames = bookmarkCategories.map(cat => cat.title[language]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen gradient-bg">
        <Navigation />

        <section className="py-12 sm:py-16 md:py-20 px-4 relative z-10">
          <div className="container mx-auto text-center">
            <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 neon-glow mb-4 sm:mb-6">
              <BookmarkCheck className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              <span className="gradient-text">Origin</span>{' '}
              {language === 'ko' ? '참고링크' : 'Reference Links'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
              {language === 'ko'
                ? 'Origin과 관련된 모든 유용한 링크를 한곳에서 확인하세요'
                : 'All useful links related to Origin in one place'}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {language === 'ko'
                ? `총 ${bookmarkCategories.reduce((acc, cat) => acc + cat.links.length, 0)}개 링크`
                : `${bookmarkCategories.reduce((acc, cat) => acc + cat.links.length, 0)} total links`}
            </p>
          </div>
        </section>

        <section className="py-6 sm:py-8 px-4 relative z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-card border-border/60">
                <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === 'ko' ? '링크 검색...' : 'Search links...'}
                        className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {totalLinks} {language === 'ko' ? '개 링크' : 'links'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === null ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {language === 'ko' ? '전체' : 'All'}
                </button>
                {allCategoryNames.map((categoryName, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedCategory(categoryName)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      selectedCategory === categoryName ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {categoryName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 px-4 relative z-10">
          <div className="container mx-auto max-w-6xl space-y-8 sm:space-y-12">
            {filteredCategories.length === 0 ? (
              <Card className="bg-card border-border/60">
                <CardContent className="py-8 sm:py-12 text-center">
                  <p className="text-muted-foreground">{language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}</p>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category, index) => (
                <div key={index} className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="gradient-text">{category.title[language]}</span>
                    <Badge variant="outline" className="text-xs sm:text-sm">{category.links.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {category.links.map((link, linkIndex) => (
                      <Card key={linkIndex} className="bg-card border-border/60 hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform">
                        <CardContent className="p-3 sm:p-4">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-2 sm:gap-3 group">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {link.name[language]}
                              </div>
                              <div className="text-[12px] sm:text-xs text-muted-foreground break-all overflow-hidden line-clamp-1">
                                {link.url}
                              </div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="py-12 px-4 bg-card/20 relative z-10">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle>{language === 'ko' ? '주의사항' : 'Note'}</CardTitle>
                <CardDescription>
                  {language === 'ko'
                    ? '관리자가 관리하는 참고링크입니다. 외부 사이트 이용 시 주의하시기 바랍니다.'
                    : 'These reference links are managed by the administrator. Please be careful when using external sites.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {language === 'ko' ? '이 페이지의 모든 링크는 새 창에서 열립니다.' : 'All links on this page open in a new window.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedPage>
  );
}
