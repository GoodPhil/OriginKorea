import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client for server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Default categories for fallback
const DEFAULT_CATEGORIES = [
  { id: '1', slug: 'general', name_ko: '일반 토론', name_en: 'General Discussion', description_ko: 'LGNS 및 Origin Korea에 대한 일반적인 토론', description_en: 'General discussions about LGNS and Origin Korea', icon: 'MessageCircle', color: 'text-blue-500', order_num: 1, is_active: true, post_count: 0 },
  { id: '2', slug: 'announcements', name_ko: '공지사항', name_en: 'Announcements', description_ko: '공식 공지사항 및 업데이트', description_en: 'Official announcements and updates', icon: 'Megaphone', color: 'text-red-500', order_num: 2, is_active: true, post_count: 0 },
  { id: '3', slug: 'staking', name_ko: '스테이킹', name_en: 'Staking', description_ko: '스테이킹 전략 및 보상에 대한 토론', description_en: 'Discussions about staking strategies and rewards', icon: 'Coins', color: 'text-green-500', order_num: 3, is_active: true, post_count: 0 },
  { id: '4', slug: 'trading', name_ko: '트레이딩', name_en: 'Trading', description_ko: '거래 전략 및 시장 분석', description_en: 'Trading strategies and market analysis', icon: 'TrendingUp', color: 'text-orange-500', order_num: 4, is_active: true, post_count: 0 },
  { id: '5', slug: 'development', name_ko: '개발', name_en: 'Development', description_ko: '기술 토론 및 개발자 리소스', description_en: 'Technical discussions and developer resources', icon: 'Code', color: 'text-purple-500', order_num: 5, is_active: true, post_count: 0 },
  { id: '6', slug: 'help', name_ko: '도움말', name_en: 'Help & Support', description_ko: '질문하고 커뮤니티의 도움을 받으세요', description_en: 'Ask questions and get help from the community', icon: 'HelpCircle', color: 'text-cyan-500', order_num: 6, is_active: true, post_count: 0 },
];

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      // Return default categories if Supabase is not configured
      return NextResponse.json({ categories: DEFAULT_CATEGORIES });
    }

    // Get categories with post counts
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select(`
        *,
        post_count:forum_posts(count)
      `)
      .eq('is_active', true)
      .order('order_num', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ categories: DEFAULT_CATEGORIES });
    }

    // Transform the data to include post_count
    const transformedCategories = categories.map(cat => ({
      ...cat,
      post_count: cat.post_count?.[0]?.count || 0,
    }));

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error('Forum categories API error:', error);
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}
