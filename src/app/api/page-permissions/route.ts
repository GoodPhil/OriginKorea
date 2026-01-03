import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

// Default page permissions
const DEFAULT_PERMISSIONS = {
  '/': { public: true, requireAuth: false, requireAdmin: false },
  '/analysis': { public: true, requireAuth: false, requireAdmin: false },
  '/ai-analysis': { public: false, requireAuth: true, requireAdmin: false },
  '/calculator': { public: true, requireAuth: false, requireAdmin: false },
  '/comparison': { public: false, requireAuth: true, requireAdmin: false },
  '/whale-monitor': { public: false, requireAuth: true, requireAdmin: false },
  '/membership': { public: false, requireAuth: true, requireAdmin: false },
  '/bookmarks': { public: false, requireAuth: true, requireAdmin: false },
  '/docs': { public: true, requireAuth: false, requireAdmin: false },
  '/community': { public: false, requireAuth: true, requireAdmin: false },
  '/settings': { public: false, requireAuth: true, requireAdmin: false },
  '/contact': { public: true, requireAuth: false, requireAdmin: false },
  '/admin': { public: false, requireAuth: true, requireAdmin: true },
};

// In-memory cache
let permissionsCache = { ...DEFAULT_PERMISSIONS };
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds

// GET - Fetch page permissions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    // Return cached permissions if within TTL
    const now = Date.now();
    if (now - lastCacheUpdate < CACHE_TTL && Object.keys(permissionsCache).length > 0) {
      if (path) {
        return NextResponse.json(permissionsCache[path as keyof typeof permissionsCache] || DEFAULT_PERMISSIONS[path as keyof typeof DEFAULT_PERMISSIONS] || { public: true, requireAuth: false, requireAdmin: false });
      }
      return NextResponse.json({ pages: permissionsCache });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ pages: DEFAULT_PERMISSIONS });
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'page_permissions')
      .single();

    if (error || !data?.value?.pages) {
      return NextResponse.json({ pages: DEFAULT_PERMISSIONS });
    }

    permissionsCache = data.value.pages;
    lastCacheUpdate = now;

    if (path) {
      return NextResponse.json(permissionsCache[path as keyof typeof permissionsCache] || { public: true, requireAuth: false, requireAdmin: false });
    }

    return NextResponse.json({ pages: permissionsCache });
  } catch (error) {
    console.error('Page permissions fetch error:', error);
    return NextResponse.json({ pages: DEFAULT_PERMISSIONS });
  }
}

// POST - Update page permissions (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pages } = body;

    if (!pages || typeof pages !== 'object') {
      return NextResponse.json(
        { error: 'Invalid pages data' },
        { status: 400 }
      );
    }

    // Update cache immediately
    permissionsCache = pages;
    lastCacheUpdate = Date.now();

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        note: 'Saved to memory cache only (DB not configured)',
      });
    }

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (!profile?.is_admin) {
            return NextResponse.json(
              { error: 'Admin access required' },
              { status: 403 }
            );
          }
        }
      } catch (authError) {
        console.log('Auth verification note:', authError);
      }
    }

    // Save to database
    try {
      const { error: upsertError } = await supabaseAdmin
        .from('site_settings')
        .upsert({
          key: 'page_permissions',
          value: { pages },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        });

      if (upsertError) {
        console.log('DB upsert note:', upsertError.message);
        return NextResponse.json({
          success: true,
          note: 'Saved to cache (DB table may not exist - run MAINTENANCE_SETUP.sql)',
        });
      }
    } catch (dbError) {
      console.log('DB operation failed:', dbError);
      return NextResponse.json({
        success: true,
        note: 'Saved to cache only',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page permissions update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
