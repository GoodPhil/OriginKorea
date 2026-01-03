import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface CommunityEvent {
  id: string;
  title_ko: string;
  title_en: string;
  description_ko: string | null;
  description_en: string | null;
  event_date: string;
  event_time: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  event_type: string;
  thumbnail_url: string | null;
  images: string[];
  location_ko: string | null;
  location_en: string | null;
  external_link: string | null;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Sample data for when Supabase is not configured
const sampleEvents: CommunityEvent[] = [
  {
    id: '1',
    title_ko: 'Origin Korea 온보딩 워크샵',
    title_en: 'Origin Korea Onboarding Workshop',
    description_ko: 'Origin Korea에 처음 참여하시는 분들을 위한 온보딩 워크샵입니다. LGNS 토큰의 기본 개념부터 스테이킹 방법까지 상세히 안내해 드립니다.',
    description_en: 'An onboarding workshop for those new to Origin Korea. We will guide you through the basics of LGNS tokens to staking methods.',
    event_date: '2025-02-15',
    event_time: '14:00 - 16:00',
    status: 'upcoming',
    event_type: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200'],
    location_ko: '서울 강남구',
    location_en: 'Gangnam, Seoul',
    external_link: null,
    is_featured: true,
    is_active: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title_ko: 'LGNS 스테이킹 전략 워크샵',
    title_en: 'LGNS Staking Strategy Workshop',
    description_ko: '효율적인 LGNS 스테이킹 전략을 배우는 심화 워크샵입니다.',
    description_en: 'An advanced workshop to learn efficient LGNS staking strategies.',
    event_date: '2025-01-25',
    event_time: '15:00 - 17:00',
    status: 'upcoming',
    event_type: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200'],
    location_ko: '온라인 (Zoom)',
    location_en: 'Online (Zoom)',
    external_link: null,
    is_featured: true,
    is_active: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title_ko: 'DAO 거버넌스 워크샵',
    title_en: 'DAO Governance Workshop',
    description_ko: 'Origin DAO의 거버넌스 참여 방법과 투표 시스템을 배우는 워크샵입니다.',
    description_en: 'A workshop to learn about Origin DAO governance participation and voting system.',
    event_date: '2024-12-28',
    event_time: '14:00 - 16:00',
    status: 'completed',
    event_type: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    images: ['https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200'],
    location_ko: '서울 강남구',
    location_en: 'Gangnam, Seoul',
    external_link: null,
    is_featured: false,
    is_active: true,
    view_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET: Fetch all events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // upcoming, completed, all
    const featured = searchParams.get('featured'); // true/false
    const limit = searchParams.get('limit');

    // If Supabase is not configured, return sample data
    if (!supabase) {
      let filteredEvents = [...sampleEvents];

      if (status && status !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.status === status);
      }
      if (featured === 'true') {
        filteredEvents = filteredEvents.filter(e => e.is_featured);
      }
      if (limit) {
        filteredEvents = filteredEvents.slice(0, parseInt(limit));
      }

      return NextResponse.json({
        events: filteredEvents,
        total: filteredEvents.length,
        source: 'sample',
      });
    }

    // Build query
    let query = supabase
      .from('community_events')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      events: data || [],
      total: data?.length || 0,
      source: 'supabase',
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST: Create new event (admin only)
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('community_events')
      .insert([{
        title_ko: body.title_ko,
        title_en: body.title_en,
        description_ko: body.description_ko,
        description_en: body.description_en,
        event_date: body.event_date,
        event_time: body.event_time,
        status: body.status || 'upcoming',
        event_type: body.event_type || 'Workshop',
        thumbnail_url: body.thumbnail_url,
        images: body.images || [],
        location_ko: body.location_ko,
        location_en: body.location_en,
        external_link: body.external_link,
        is_featured: body.is_featured || false,
        is_active: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
