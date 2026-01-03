import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Sample event for demo
const sampleEvent = {
  id: '1',
  title_ko: 'Origin Korea 온보딩 워크샵',
  title_en: 'Origin Korea Onboarding Workshop',
  description_ko: 'Origin Korea에 처음 참여하시는 분들을 위한 온보딩 워크샵입니다. LGNS 토큰의 기본 개념부터 스테이킹 방법까지 상세히 안내해 드립니다.\n\n### 워크샵 내용\n- LGNS 토큰 소개\n- 지갑 설정 방법\n- 스테이킹 기초\n- Q&A 세션',
  description_en: 'An onboarding workshop for those new to Origin Korea. We will guide you through the basics of LGNS tokens to staking methods.\n\n### Workshop Content\n- Introduction to LGNS tokens\n- Wallet setup guide\n- Staking basics\n- Q&A session',
  event_date: '2025-02-15',
  event_time: '14:00 - 16:00',
  status: 'upcoming',
  event_type: 'Workshop',
  thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  images: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  ],
  location_ko: '서울 강남구',
  location_en: 'Gangnam, Seoul',
  external_link: null,
  is_featured: true,
  is_active: true,
  view_count: 128,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// GET: Fetch single event by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabase) {
      // Return sample event for demo
      return NextResponse.json({
        event: { ...sampleEvent, id },
        source: 'sample',
      });
    }

    // Increment view count
    await supabase.rpc('increment_event_view_count', { event_id: id });

    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      event: data,
      source: 'supabase',
    });
  } catch (error) {
    console.error('Event API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT: Update event (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('community_events')
      .update({
        title_ko: body.title_ko,
        title_en: body.title_en,
        description_ko: body.description_ko,
        description_en: body.description_en,
        event_date: body.event_date,
        event_time: body.event_time,
        status: body.status,
        event_type: body.event_type,
        thumbnail_url: body.thumbnail_url,
        images: body.images,
        location_ko: body.location_ko,
        location_en: body.location_en,
        external_link: body.external_link,
        is_featured: body.is_featured,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE: Delete event (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('community_events')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
