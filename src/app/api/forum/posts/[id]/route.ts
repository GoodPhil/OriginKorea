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

// Sample post for demo
const SAMPLE_POST = {
  id: 'sample-1',
  category_id: '1',
  author_id: null,
  title: 'Welcome to Origin Korea Forum!',
  content: `# Welcome to Origin Korea Forum!

This is the official community forum for Origin Korea. Here you can:

- Discuss LGNS token and its ecosystem
- Share staking strategies and tips
- Get help from the community
- Stay updated with announcements

## Community Guidelines

1. Be respectful to all members
2. No spam or promotional content
3. Stay on topic
4. Share knowledge and help others

We're excited to have you here. Let's build the future of decentralized finance together!`,
  view_count: 150,
  like_count: 25,
  comment_count: 3,
  is_pinned: true,
  is_locked: false,
  is_active: true,
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  author: { id: 'admin', display_name: 'Admin', email: 'admin@origin.kr' },
  category: { id: '1', slug: 'general', name_ko: '일반 토론', name_en: 'General Discussion', icon: 'MessageCircle', color: 'text-blue-500' },
  comments: [
    {
      id: 'comment-1',
      post_id: 'sample-1',
      author_id: 'user1',
      parent_id: null,
      content: 'Great introduction! Looking forward to learning more about LGNS staking.',
      like_count: 5,
      is_active: true,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: 'user1', display_name: 'CryptoEnthusiast', email: 'user1@example.com' },
    },
    {
      id: 'comment-2',
      post_id: 'sample-1',
      author_id: 'user2',
      parent_id: null,
      content: 'Thank you for setting up this community. Very helpful!',
      like_count: 3,
      is_active: true,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: 'user2', display_name: 'TraderKim', email: 'user2@example.com' },
    },
  ],
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      // Return sample post for demo
      if (id === 'sample-1' || id.startsWith('sample')) {
        return NextResponse.json({ post: SAMPLE_POST });
      }
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get post with related data
    const { data: post, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        category:forum_categories(id, slug, name_ko, name_en, icon, color),
        author:profiles(id, display_name, email)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await supabase
      .from('forum_posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', id);

    // Get comments
    const { data: comments } = await supabase
      .from('forum_comments')
      .select(`
        *,
        author:profiles(id, display_name, email)
      `)
      .eq('post_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      post: {
        ...post,
        view_count: post.view_count + 1,
        comments: comments || [],
      },
    });
  } catch (error) {
    console.error('Forum post GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServer();

    if (!supabase) {
      return NextResponse.json({ error: 'Forum is not configured' }, { status: 503 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, is_pinned, is_locked } = body;

    const adminSupabase = getSupabaseAdmin();
    if (!adminSupabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Check ownership or admin status
    const { data: existingPost } = await adminSupabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isOwner = existingPost?.author_id === user.id;
    const isAdmin = profile?.is_admin || false;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (isAdmin && is_pinned !== undefined) updates.is_pinned = is_pinned;
    if (isAdmin && is_locked !== undefined) updates.is_locked = is_locked;

    const { data: post, error: updateError } = await adminSupabase
      .from('forum_posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:forum_categories(id, slug, name_ko, name_en, icon, color),
        author:profiles(id, display_name, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating post:', updateError);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Forum post PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServer();

    if (!supabase) {
      return NextResponse.json({ error: 'Forum is not configured' }, { status: 503 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const adminSupabase = getSupabaseAdmin();
    if (!adminSupabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Check ownership or admin status
    const { data: existingPost } = await adminSupabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isOwner = existingPost?.author_id === user.id;
    const isAdmin = profile?.is_admin || false;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Soft delete
    const { error: deleteError } = await adminSupabase
      .from('forum_posts')
      .update({ is_active: false })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forum post DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
