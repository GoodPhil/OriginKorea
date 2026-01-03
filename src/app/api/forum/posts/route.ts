import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Create admin client for server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Create server client with cookies for auth
async function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

// Sample posts for demo (when Supabase is not configured)
const SAMPLE_POSTS = [
  {
    id: 'sample-1',
    category_id: '1',
    author_id: null,
    title: 'Welcome to Origin Korea Forum!',
    content: 'This is the official community forum for Origin Korea. Feel free to discuss LGNS, staking strategies, and more!',
    view_count: 150,
    like_count: 25,
    comment_count: 12,
    is_pinned: true,
    is_locked: false,
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    author: { id: 'admin', display_name: 'Admin', email: 'admin@origin.kr' },
    category: { slug: 'general', name_ko: '일반 토론', name_en: 'General Discussion' },
  },
  {
    id: 'sample-2',
    category_id: '3',
    author_id: null,
    title: 'LGNS Staking Guide for Beginners',
    content: 'A comprehensive guide to staking LGNS tokens and maximizing your rewards.',
    view_count: 89,
    like_count: 15,
    comment_count: 8,
    is_pinned: false,
    is_locked: false,
    is_active: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    author: { id: 'user1', display_name: 'CryptoEnthusiast', email: 'user1@example.com' },
    category: { slug: 'staking', name_ko: '스테이킹', name_en: 'Staking' },
  },
  {
    id: 'sample-3',
    category_id: '4',
    author_id: null,
    title: 'Market Analysis: LGNS Price Action',
    content: 'Discussing the recent price movements and what to expect next.',
    view_count: 67,
    like_count: 8,
    comment_count: 5,
    is_pinned: false,
    is_locked: false,
    is_active: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: { id: 'user2', display_name: 'TraderKim', email: 'user2@example.com' },
    category: { slug: 'trading', name_ko: '트레이딩', name_en: 'Trading' },
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      // Return sample posts if Supabase is not configured
      let filteredPosts = [...SAMPLE_POSTS];

      if (category) {
        filteredPosts = filteredPosts.filter(p => p.category?.slug === category);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = filteredPosts.filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.content.toLowerCase().includes(searchLower)
        );
      }

      return NextResponse.json({
        posts: filteredPosts,
        total: filteredPosts.length,
        page,
        limit,
        hasMore: false,
      });
    }

    // Build query
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        category:forum_categories(id, slug, name_ko, name_en, icon, color),
        author:profiles(id, display_name, email)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    // Filter by category
    if (category) {
      const { data: categoryData } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({
        posts: SAMPLE_POSTS,
        total: SAMPLE_POSTS.length,
        page,
        limit,
        hasMore: false,
      });
    }

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      page,
      limit,
      hasMore: count ? offset + limit < count : false,
    });
  } catch (error) {
    console.error('Forum posts API error:', error);
    return NextResponse.json({
      posts: SAMPLE_POSTS,
      total: SAMPLE_POSTS.length,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Forum is not configured' },
        { status: 503 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { category_id, title, content } = body;

    if (!category_id || !title || !content) {
      return NextResponse.json(
        { error: 'Category, title, and content are required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Create post using admin client
    const adminSupabase = getSupabaseAdmin();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data: post, error: insertError } = await adminSupabase
      .from('forum_posts')
      .insert({
        category_id,
        author_id: user.id,
        title,
        content,
      })
      .select(`
        *,
        category:forum_categories(id, slug, name_ko, name_en, icon, color),
        author:profiles(id, display_name, email)
      `)
      .single();

    if (insertError) {
      console.error('Error creating post:', insertError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Forum post creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
