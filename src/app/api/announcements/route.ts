import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface Announcement {
  id: string;
  title_ko: string;
  title_en: string;
  content_ko: string;
  content_en: string;
  type: 'notice' | 'update' | 'event' | 'important';
  is_pinned: boolean;
  is_popup: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Default announcements for fallback - NO POPUPS by default
// Admin can enable popups through the admin panel
const defaultAnnouncements: Announcement[] = [
  {
    id: '1',
    title_ko: 'Origin Korea 커뮤니티에 오신 것을 환영합니다',
    title_en: 'Welcome to Origin Korea Community',
    content_ko: 'Origin Korea는 알고리즘 통화 LGNS를 기반으로 한 탈중앙화 금융 플랫폼입니다. 함께 성장하는 커뮤니티가 되기를 바랍니다.',
    content_en: 'Origin Korea is a decentralized financial platform based on algorithmic currency LGNS. We hope to become a growing community together.',
    type: 'notice',
    is_pinned: true,
    is_popup: false,
    is_active: true,
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    title_ko: 'v315 업데이트 안내',
    title_en: 'v315 Update Notice',
    content_ko: '고래 추적 페이지가 개선되었습니다. 고래 지갑 추적과 대규모 거래 모니터링을 한 곳에서 확인하세요.',
    content_en: 'Whale tracking page has been improved. Check whale wallet tracking and large transaction monitoring in one place.',
    type: 'update',
    is_pinned: false,
    is_popup: false,
    is_active: true,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
];

// In-memory cache for announcements (initialized with defaults)
let cachedAnnouncements: Announcement[] = [...defaultAnnouncements];

// Helper to check if error is "table not found"
function isTableNotFoundError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || '';
  return msg.includes('not found') ||
         msg.includes('does not exist') ||
         msg.includes('schema cache') ||
         error.code === '42P01';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const popupOnly = searchParams.get('popup') === 'true';
  const activeOnly = searchParams.get('active') !== 'false';

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      let announcements = [...cachedAnnouncements];
      if (activeOnly) announcements = announcements.filter(a => a.is_active);
      if (popupOnly) announcements = announcements.filter(a => a.is_popup);
      return NextResponse.json({ announcements, source: 'local' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);
    if (popupOnly) query = query.eq('is_popup', true);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Table doesn't exist or empty - use local cache
      let announcements = [...cachedAnnouncements];
      if (activeOnly) announcements = announcements.filter(a => a.is_active);
      if (popupOnly) announcements = announcements.filter(a => a.is_popup);
      return NextResponse.json({ announcements, source: 'local' });
    }

    return NextResponse.json({ announcements: data, source: 'database' });
  } catch (error) {
    let announcements = [...cachedAnnouncements];
    if (activeOnly) announcements = announcements.filter(a => a.is_active);
    if (popupOnly) announcements = announcements.filter(a => a.is_popup);
    return NextResponse.json({ announcements, source: 'local' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try database first
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('announcements')
          .insert([{
            title_ko: body.title_ko,
            title_en: body.title_en,
            content_ko: body.content_ko,
            content_en: body.content_en,
            type: body.type || 'notice',
            is_pinned: body.is_pinned || false,
            is_popup: body.is_popup || false,
            is_active: body.is_active !== false,
          }])
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ announcement: data, success: true, source: 'database' });
        }

        // If table doesn't exist, fall through to local cache
        if (isTableNotFoundError(error)) {
          console.log('Announcements table not found, using local cache');
        } else {
          console.error('Database error:', error);
        }
      } catch (dbError) {
        console.log('Database error, falling back to local cache:', dbError);
      }
    }

    // Fallback to local cache
    const newAnnouncement: Announcement = {
      id: `local-${Date.now()}`,
      title_ko: body.title_ko || '',
      title_en: body.title_en || '',
      content_ko: body.content_ko || '',
      content_en: body.content_en || '',
      type: body.type || 'notice',
      is_pinned: body.is_pinned || false,
      is_popup: body.is_popup || false,
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cachedAnnouncements.unshift(newAnnouncement);
    return NextResponse.json({ announcement: newAnnouncement, success: true, source: 'local' });
  } catch (error) {
    console.error('Error in announcements POST:', error);
    return NextResponse.json({ error: 'Failed to create announcement', success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required', success: false }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try database first
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('announcements')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ announcement: data, success: true, source: 'database' });
        }

        // If table doesn't exist, fall through to local cache
        if (isTableNotFoundError(error)) {
          console.log('Announcements table not found, using local cache');
        } else {
          console.error('Database error:', error);
        }
      } catch (dbError) {
        console.log('Database error, falling back to local cache:', dbError);
      }
    }

    // Fallback to local cache
    const index = cachedAnnouncements.findIndex(a => a.id === id);
    if (index !== -1) {
      cachedAnnouncements[index] = {
        ...cachedAnnouncements[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ announcement: cachedAnnouncements[index], success: true, source: 'local' });
    }

    return NextResponse.json({ error: 'Announcement not found', success: false }, { status: 404 });
  } catch (error) {
    console.error('Error in announcements PUT:', error);
    return NextResponse.json({ error: 'Failed to update announcement', success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required', success: false }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try database first
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);

        if (!error) {
          return NextResponse.json({ success: true, source: 'database' });
        }

        // If table doesn't exist, fall through to local cache
        if (isTableNotFoundError(error)) {
          console.log('Announcements table not found, using local cache');
        } else {
          console.error('Database error:', error);
        }
      } catch (dbError) {
        console.log('Database error, falling back to local cache:', dbError);
      }
    }

    // Fallback to local cache
    const initialLength = cachedAnnouncements.length;
    cachedAnnouncements = cachedAnnouncements.filter(a => a.id !== id);

    if (cachedAnnouncements.length < initialLength) {
      return NextResponse.json({ success: true, source: 'local' });
    }

    return NextResponse.json({ error: 'Announcement not found', success: false }, { status: 404 });
  } catch (error) {
    console.error('Error in announcements DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete announcement', success: false }, { status: 500 });
  }
}
