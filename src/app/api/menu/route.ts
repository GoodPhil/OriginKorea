import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Default menu items with IDs for local storage support
// Updated: Removed membership, renamed calculator to staking
const defaultMenuItems = [
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

// In-memory cache for menu items
let cachedMenuItems = [...defaultMenuItems];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Return cached menu items if Supabase is not configured
      return NextResponse.json({
        items: cachedMenuItems,
        source: 'local',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      // Table doesn't exist or other error - return cached items
      console.error('Menu items table not found, using local cache:', error.message);
      return NextResponse.json({
        items: cachedMenuItems,
        source: 'local',
      });
    }

    if (data && data.length > 0) {
      return NextResponse.json({
        items: data,
        source: 'database',
      });
    }

    // No data in database, return cached
    return NextResponse.json({
      items: cachedMenuItems,
      source: 'local',
    });
  } catch (error) {
    console.error('Error in menu API:', error);
    return NextResponse.json({
      items: cachedMenuItems,
      source: 'local',
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required', success: false },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try database first if configured
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
          .from('menu_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ item: data, success: true, source: 'database' });
        }

        // If table doesn't exist or other error, fall through to local cache
        console.log('Database update failed, using local cache:', error?.message);
      } catch (dbError) {
        console.log('Database error, falling back to local cache:', dbError);
      }
    }

    // Fallback to local cache
    const index = cachedMenuItems.findIndex(item => item.id === id || item.key === id);
    if (index !== -1) {
      cachedMenuItems[index] = { ...cachedMenuItems[index], ...updates };
      return NextResponse.json({
        item: cachedMenuItems[index],
        success: true,
        source: 'local'
      });
    }

    return NextResponse.json(
      { error: 'Menu item not found', success: false },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in menu update API:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item', success: false },
      { status: 500 }
    );
  }
}
