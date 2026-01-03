'use client';

import { useState, useEffect } from 'react';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Eye,
  EyeOff,
  Navigation as NavIcon,
  LayoutGrid,
  RefreshCw,
  GripVertical,
  Shield,
  BarChart3,
  BookOpen,
  BookmarkCheck,
  Calculator,
  Users,
  Vote,
  Bell,
  MessageSquare,
  GitCompare,
  Fish,
  Crown,
  Brain,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  BookOpen,
  BookmarkCheck,
  Calculator,
  Users,
  Vote,
  Bell,
  MessageSquare,
  GitCompare,
  Fish,
  Crown,
  Brain,
};



// Menu item row component (non-sortable fallback for SSR)
function MenuItemRow({
  item,
  language,
  updating,
  onToggle,
  t,
  sortable = false,
}: {
  item: MenuItem;
  language: 'ko' | 'en';
  updating: string | null;
  onToggle: (item: MenuItem, field: 'is_visible' | 'show_in_nav' | 'show_in_footer') => void;
  t: Record<string, string>;
  sortable?: boolean;
}) {
  const Icon = iconMap[item.icon];
  const isUpdatingThis = updating === item.id;

  return (
    <tr className="border-b border-border/50 hover:bg-secondary/30 dark:hover:bg-secondary/20">
      <td className="py-3 px-2">
        {sortable && (
          <div className="p-1.5 rounded hover:bg-secondary dark:hover:bg-secondary/50 transition-colors cursor-grab">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </td>
      <td className="py-3 px-2">
        <span className="text-sm font-medium text-muted-foreground">
          {item.sort_order}
        </span>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <div>
            <p className="font-medium">{language === 'ko' ? item.label_ko : item.label_en}</p>
            <p className="text-xs text-muted-foreground">{item.href}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={item.is_visible}
            onCheckedChange={() => onToggle(item, 'is_visible')}
            disabled={isUpdatingThis || !item.id}
          />
          <Badge
            variant={item.is_visible ? 'default' : 'secondary'}
            className={`min-w-[60px] ${item.is_visible ? 'dark:bg-green-600' : 'dark:bg-gray-600'}`}
          >
            {item.is_visible ? (
              <><Eye className="h-3 w-3 mr-1" />{t.visible}</>
            ) : (
              <><EyeOff className="h-3 w-3 mr-1" />{t.hidden}</>
            )}
          </Badge>
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={item.show_in_nav}
            onCheckedChange={() => onToggle(item, 'show_in_nav')}
            disabled={isUpdatingThis || !item.id || !item.is_visible}
          />
          <NavIcon className={`h-4 w-4 ${item.show_in_nav && item.is_visible ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={item.show_in_footer}
            onCheckedChange={() => onToggle(item, 'show_in_footer')}
            disabled={isUpdatingThis || !item.id || !item.is_visible}
          />
          <LayoutGrid className={`h-4 w-4 ${item.show_in_footer && item.is_visible ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </td>
    </tr>
  );
}

export default function AdminMenuPage() {
  const { language } = useLanguage();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { allItems, loading, source, fetchMenuItems, updateMenuItem } = useMenuItems();
  const [updating, setUpdating] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<MenuItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync local items with fetched items
  useEffect(() => {
    setLocalItems(allItems);
  }, [allItems]);

  const texts = {
    ko: {
      title: '메뉴 관리',
      subtitle: '네비게이션 및 푸터에 표시되는 메뉴를 관리합니다',
      menuItem: '메뉴 항목',
      visibility: '표시 여부',
      showInNav: '상단 메뉴',
      showInFooter: '하단 메뉴',
      order: '순서',
      drag: '이동',
      actions: '작업',
      visible: '표시',
      hidden: '숨김',
      refresh: '새로고침',
      dataSource: '데이터 출처',
      database: '데이터베이스',
      default: '기본값',
      noAccess: '관리자 권한이 필요합니다',
      loading: '로딩 중...',
      updateSuccess: '업데이트 완료',
      updateError: '업데이트 실패',
      navMenu: '상단 네비게이션',
      footerMenu: '푸터 메뉴',
      enabled: '활성화',
      disabled: '비활성화',
      setupRequired: 'Supabase에서 MENU_SETUP.sql을 실행하여 메뉴 테이블을 생성하세요.',
      saveOrder: '순서 저장',
      orderChanged: '순서가 변경되었습니다',
      savingOrder: '저장 중...',
      orderSaved: '순서 저장 완료!',
      dragHint: '드래그하여 메뉴 순서를 변경하세요',
    },
    en: {
      title: 'Menu Management',
      subtitle: 'Manage menus displayed in navigation and footer',
      menuItem: 'Menu Item',
      visibility: 'Visibility',
      showInNav: 'Top Menu',
      showInFooter: 'Footer Menu',
      order: 'Order',
      drag: 'Move',
      actions: 'Actions',
      visible: 'Visible',
      hidden: 'Hidden',
      refresh: 'Refresh',
      dataSource: 'Data Source',
      database: 'Database',
      default: 'Default',
      noAccess: 'Admin access required',
      loading: 'Loading...',
      updateSuccess: 'Update successful',
      updateError: 'Update failed',
      navMenu: 'Top Navigation',
      footerMenu: 'Footer Menu',
      enabled: 'Enabled',
      disabled: 'Disabled',
      setupRequired: 'Run MENU_SETUP.sql in Supabase to create the menu table.',
      saveOrder: 'Save Order',
      orderChanged: 'Order has changed',
      savingOrder: 'Saving...',
      orderSaved: 'Order saved!',
      dragHint: 'Drag to reorder menu items',
    },
  };

  const t = texts[language];

  const handleToggle = async (item: MenuItem, field: 'is_visible' | 'show_in_nav' | 'show_in_footer') => {
    if (!item.id) return;
    setUpdating(item.id);
    const success = await updateMenuItem(item.id, { [field]: !item[field] });
    setUpdating(null);
    if (!success) {
      alert(t.updateError);
    }
  };

  if (authLoading || loading || !mounted) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{t.noAccess}</p>
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-3">
                <Menu className="h-8 w-8" />
                {t.title}
              </h1>
              <p className="text-base text-muted-foreground mt-1">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant={source === 'database' ? 'default' : source === 'local' ? 'default' : 'secondary'}
                className={source === 'database' ? 'bg-green-600 dark:bg-green-700' : source === 'local' ? 'bg-blue-600 dark:bg-blue-700' : ''}
              >
                {t.dataSource}: {source === 'database' ? t.database : source === 'local' ? (language === 'ko' ? '로컬 저장소' : 'Local Storage') : t.default}
              </Badge>
              <Button onClick={fetchMenuItems} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.refresh}
              </Button>
            </div>
          </div>
        </div>

        {/* Setup Notice - only show for default source, not local */}
        {source === 'default' && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{t.setupRequired}</p>
            </CardContent>
          </Card>
        )}
        {source === 'local' && (
          <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {language === 'ko'
                  ? '메뉴 설정이 브라우저 로컬 저장소에 저장됩니다. 데이터베이스 연동 시 MENU_SETUP.sql을 실행하세요.'
                  : 'Menu settings are saved to browser local storage. Run MENU_SETUP.sql for database integration.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Table */}
        <Card className="bg-card border-border/60 dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              {t.menuItem}
            </CardTitle>
            <CardDescription>
              {t.dragHint}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border dark:border-border/70">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-10">{t.drag}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-16">{t.order}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t.menuItem}</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t.visibility}</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t.showInNav}</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t.showInFooter}</th>
                  </tr>
                </thead>
                <tbody>
                  {localItems.map((item) => (
                    <MenuItemRow
                      key={item.key}
                      item={item}
                      language={language}
                      updating={updating}
                      onToggle={handleToggle}
                      t={t}
                      sortable={true}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Nav Preview */}
          <Card className="bg-card border-border/60 dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <NavIcon className="h-5 w-5 text-primary" />
                {t.navMenu}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {localItems
                  .filter((item) => item.is_visible && item.show_in_nav)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <Badge key={item.key} variant="outline" className="px-3 py-1 dark:border-border">
                      {language === 'ko' ? item.label_ko : item.label_en}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer Preview */}
          <Card className="bg-card border-border/60 dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutGrid className="h-5 w-5 text-primary" />
                {t.footerMenu}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {localItems
                  .filter((item) => item.is_visible && item.show_in_footer)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <Badge key={item.key} variant="outline" className="px-3 py-1 dark:border-border">
                      {language === 'ko' ? item.label_ko : item.label_en}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
