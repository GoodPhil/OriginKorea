import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client for registration operations
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'goodphil@gmail.com';

// Send email notification to admin (using Supabase Edge Function or external service)
async function sendAdminNotification(registrationData: {
  email: string;
  display_name: string;
  phone?: string;
  reason: string;
  referral_source?: string;
}) {
  try {
    // Option 1: Use Supabase Edge Function (if configured)
    if (supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin.functions.invoke('send-registration-notification', {
          body: {
            adminEmail: ADMIN_EMAIL,
            applicant: registrationData,
            timestamp: new Date().toISOString(),
          },
        });

        if (!error) {
          console.log('Admin notification sent successfully');
          return true;
        }
        console.log('Edge function not available:', error.message);
      } catch (funcError) {
        console.log('Edge function error (may not be configured):', funcError);
      }
    }

    // Option 2: Store notification in database for later processing
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('admin_notifications').insert({
          type: 'new_registration',
          data: {
            applicant_email: registrationData.email,
            applicant_name: registrationData.display_name,
            reason: registrationData.reason,
            phone: registrationData.phone,
            referral_source: registrationData.referral_source,
          },
          is_read: false,
          admin_email: ADMIN_EMAIL,
        });
        console.log('Admin notification stored in database');
      } catch {
        // Table might not exist, ignore error
        console.log('admin_notifications table may not exist');
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

// Submit registration request
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, display_name, phone, reason, referral_source, additional_info } = body;

    // Validation
    if (!email || !display_name || !reason) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요. (Please fill in all required fields.)' },
        { status: 400 }
      );
    }

    // Check if email already registered in auth.users
    try {
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const emailExists = existingUser?.users?.some(u => u.email === email);

      if (emailExists) {
        return NextResponse.json(
          { error: '이미 가입된 이메일입니다. 로그인을 시도해주세요. (Email already registered.)' },
          { status: 400 }
        );
      }
    } catch (authError) {
      console.log('Auth check error (may require service role key):', authError);
      // Continue anyway - user might not exist
    }

    // Try to check for existing request and insert new one
    try {
      // Check if already has pending request
      const { data: existingRequest, error: selectError } = await supabaseAdmin
        .from('registration_requests')
        .select('id, status')
        .eq('email', email)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        // Other errors might mean table doesn't exist
        if (selectError.message.includes('does not exist')) {
          console.error('registration_requests table does not exist');
          return NextResponse.json(
            {
              error: '데이터베이스 설정이 필요합니다. 관리자에게 문의해주세요. (Database setup required.)',
              details: 'registration_requests table not found'
            },
            { status: 500 }
          );
        }
        console.error('Select error:', selectError);
      }

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return NextResponse.json(
            { error: '이미 가입 신청이 접수되어 심사 중입니다. (Application already pending.)' },
            { status: 400 }
          );
        } else if (existingRequest.status === 'rejected') {
          // Allow resubmission if previously rejected - update existing record
          const { error: updateError } = await supabaseAdmin
            .from('registration_requests')
            .update({
              display_name,
              phone: phone || null,
              reason,
              referral_source: referral_source || null,
              additional_info: additional_info || null,
              status: 'pending',
              admin_notes: null,
              reviewed_by: null,
              reviewed_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRequest.id);

          if (updateError) {
            console.error('Registration update error:', updateError);
            return NextResponse.json(
              { error: '가입 신청 업데이트 중 오류가 발생했습니다. (Update error.)' },
              { status: 500 }
            );
          }

          // Send notification to admin for resubmission
          sendAdminNotification({
            email,
            display_name,
            phone,
            reason,
            referral_source,
          }).catch(err => {
            console.error('Notification error:', err);
          });

          return NextResponse.json({
            success: true,
            message: '가입 신청이 다시 접수되었습니다. 관리자 승인 후 이용 가능합니다.',
          });
        } else if (existingRequest.status === 'approved') {
          return NextResponse.json(
            { error: '이미 승인된 신청입니다. 로그인을 시도해주세요. (Already approved.)' },
            { status: 400 }
          );
        }
      }

      // Create new registration request
      const { error: insertError } = await supabaseAdmin
        .from('registration_requests')
        .insert({
          email,
          display_name,
          phone: phone || null,
          reason,
          referral_source: referral_source || null,
          additional_info: additional_info || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Registration insert error:', insertError);

        // Provide more specific error messages
        if (insertError.message.includes('does not exist')) {
          return NextResponse.json(
            { error: '데이터베이스 테이블이 없습니다. 관리자에게 문의해주세요.' },
            { status: 500 }
          );
        }
        if (insertError.message.includes('duplicate')) {
          return NextResponse.json(
            { error: '이미 신청된 이메일입니다.' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: `가입 신청 중 오류가 발생했습니다: ${insertError.message}` },
          { status: 500 }
        );
      }

      // Send notification to admin (non-blocking)
      sendAdminNotification({
        email,
        display_name,
        phone,
        reason,
        referral_source,
      }).catch(err => {
        console.error('Notification error:', err);
      });

      return NextResponse.json({
        success: true,
        message: '가입 신청이 접수되었습니다. 관리자 승인 후 이용 가능합니다.',
      });

    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Registration request error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

// Check registration status by email
export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status'); // For admin to filter by status

    // If status filter is provided (admin use)
    if (status) {
      try {
        const { data, error } = await supabaseAdmin
          .from('registration_requests')
          .select('*')
          .eq('status', status)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Registration fetch error:', error);
          return NextResponse.json({ registrations: [] });
        }

        return NextResponse.json({ registrations: data || [] });
      } catch {
        return NextResponse.json({ registrations: [] });
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('registration_requests')
        .select('status, created_at, reviewed_at, admin_notes')
        .eq('email', email)
        .single();

      if (error || !data) {
        return NextResponse.json({
          found: false,
          message: '가입 신청 내역이 없습니다.',
        });
      }

      return NextResponse.json({
        found: true,
        status: data.status,
        created_at: data.created_at,
        reviewed_at: data.reviewed_at,
        admin_notes: data.status === 'rejected' ? data.admin_notes : null,
      });
    } catch {
      return NextResponse.json({
        found: false,
        message: '가입 신청 내역이 없습니다.',
      });
    }

  } catch (error) {
    console.error('Registration status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
