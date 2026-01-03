import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Create admin client
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

// Helper to check if user is admin
async function isUserAdmin(): Promise<{ isAdmin: boolean; userId: string | null }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { isAdmin: false, userId: null };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, userId: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return { isAdmin: profile?.is_admin === true, userId: user.id };
}

// GET - List all registration requests (admin only)
export async function GET(request: Request) {
  try {
    const { isAdmin } = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let query = supabaseAdmin
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching registrations:', error);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }

    // Get stats
    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      approved: data?.filter(r => r.status === 'approved').length || 0,
      rejected: data?.filter(r => r.status === 'rejected').length || 0,
    };

    return NextResponse.json({ registrations: data || [], stats });

  } catch (error) {
    console.error('Error in GET registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Approve or reject registration
export async function POST(request: Request) {
  try {
    const { isAdmin, userId } = await isUserAdmin();
    if (!isAdmin || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, action, admin_notes, temp_password } = body;

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get registration request
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('registration_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'pending') {
      return NextResponse.json({ error: 'Registration already processed' }, { status: 400 });
    }

    if (action === 'approve') {
      // Create user account
      const password = temp_password || generateTempPassword();

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: registration.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: registration.display_name,
        },
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }

      // Create profile
      if (newUser.user) {
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: newUser.user.id,
            email: registration.email,
            display_name: registration.display_name,
            is_admin: false,
            price_alert_enabled: false,
            price_alert_threshold: 5,
          });
      }

      // Update registration status
      await supabaseAdmin
        .from('registration_requests')
        .update({
          status: 'approved',
          admin_notes: admin_notes || null,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: '가입이 승인되었습니다.',
        email: registration.email,
        temp_password: password,
      });

    } else {
      // Reject
      await supabaseAdmin
        .from('registration_requests')
        .update({
          status: 'rejected',
          admin_notes: admin_notes || '가입 신청이 거절되었습니다.',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: '가입이 거절되었습니다.',
      });
    }

  } catch (error) {
    console.error('Error in POST registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Generate temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
