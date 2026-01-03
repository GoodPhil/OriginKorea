'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MenuItem {
  id?: string;
  key: string;
  href: string;
  label_ko: string;
  label_en: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
  show_in_nav: boolean;
  show_in_footer: boolean;
}

interface MenuData {
  items: MenuItem[];
  source: 'database' | 'default' | 'local';
  error?: string;
  success?: boolean;
}

// Default menu items - New order:
// AI 분석, 분석, 비교 분석, 추적, 스테이킹, 참고링크, 문서, 커뮤니티, 공지
const defaultMenuItems: MenuItem[] = [
  { id: 'menu-1', key: 'ai-analysis', href: '/ai-analysis', label_ko: 'AI 분석', label_en: 'AI Analysis', icon: 'Brain', sort_order: 1, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-2', key: 'analysis', href: '/analysis', label_ko: '기술 분석', label_en: 'Technical Analysis', icon: 'BarChart3', sort_order: 2, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-3', key: 'comparison', href: '/comparison', label_ko: '비교 분석', label_en: 'Comparison', icon: 'GitCompare', sort_order: 3, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-4', key: 'whale-monitor', href: '/whale-monitor', label_ko: '온체인 분석', label_en: 'On-Chain Analysis', icon: 'Fish', sort_order: 4, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-5', key: 'staking', href: '/calculator', label_ko: '스테이킹', label_en: 'Staking', icon: 'Calculator', sort_order: 5, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-6', key: 'bookmarks', href: '/bookmarks', label_ko: '참고링크', label_en: 'Bookmarks', icon: 'BookmarkCheck', sort_order: 6, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-7', key: 'docs', href: '/docs', label_ko: '문서', label_en: 'Docs', icon: 'BookOpen', sort_order: 7, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-8', key: 'community', href: '/community', label_ko: '커뮤니티', label_en: 'Community', icon: 'Users', sort_order: 8, is_visible: true, show_in_nav: true, show_in_footer: true },
  { id: 'menu-9', key: 'announcements', href: '/announcements', label_ko: '공지', label_en: 'Announcements', icon: 'Bell', sort_order: 9, is_visible: true, show_in_nav: true, show_in_footer: true },
];

// Load from localStorage
function loadLocalMenuItems(): MenuItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('menuItems');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading menu items from localStorage:', e);
  }
  return null;
}

// Save to localStorage
function saveLocalMenuItems(items: MenuItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('menuItems', JSON.stringify(items));
  } catch (e) {
    console.error('Error saving menu items to localStorage:', e);
  }
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'default' | 'local'>('default');

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/menu');
      const data: MenuData = await response.json();

      if (data.items && data.items.length > 0) {
        // Use items from API (could be database or local cache)
        setMenuItems(data.items);
        setSource(data.source || 'local');
        // Also save to localStorage for client-side persistence
        if (data.source !== 'database') {
          saveLocalMenuItems(data.items);
        }
      } else {
        // Try localStorage first
        const localItems = loadLocalMenuItems();
        if (localItems && localItems.length > 0) {
          setMenuItems(localItems);
          setSource('local');
        } else {
          // Use defaults
          setMenuItems(defaultMenuItems);
          setSource('default');
          saveLocalMenuItems(defaultMenuItems);
        }
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to fetch menu items');
      // Try localStorage on error
      const localItems = loadLocalMenuItems();
      if (localItems && localItems.length > 0) {
        setMenuItems(localItems);
        setSource('local');
      } else {
        setMenuItems(defaultMenuItems);
        setSource('default');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    setError(null);

    // Optimistically update local state
    const updatedItems = menuItems.map(item => {
      if (item.id === id || item.key === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    setMenuItems(updatedItems);
    saveLocalMenuItems(updatedItems);

    // Try API update
    try {
      const response = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      const result = await response.json();

      if (result.success) {
        // If API succeeded, refresh to get latest
        if (result.source === 'database') {
          await fetchMenuItems();
        }
        setSource(result.source || 'local');
        return true;
      } else {
        // API failed but we already updated locally
        setSource('local');
        return true;
      }
    } catch (err) {
      console.error('API update failed, using local update:', err);
      setSource('local');
      return true;
    }
  }, [fetchMenuItems, menuItems]);

  // Deprecated items to filter out (removed features)
  const deprecatedItems = ['membership', 'wallet', 'portfolio'];

  // Get navigation menu items (visible and show_in_nav, excluding deprecated)
  const navItems = menuItems
    .filter((item) => item.is_visible && item.show_in_nav && !deprecatedItems.includes(item.key))
    .sort((a, b) => a.sort_order - b.sort_order);

  // Get footer menu items (visible and show_in_footer, excluding deprecated)
  const footerItems = menuItems
    .filter((item) => item.is_visible && item.show_in_footer && !deprecatedItems.includes(item.key))
    .sort((a, b) => a.sort_order - b.sort_order);

  // Get all items for admin
  const allItems = [...menuItems].sort((a, b) => a.sort_order - b.sort_order);

  return {
    menuItems,
    navItems,
    footerItems,
    allItems,
    loading,
    error,
    source,
    fetchMenuItems,
    updateMenuItem,
  };
}
