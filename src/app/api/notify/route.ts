import { NextResponse } from 'next/server';

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'goodphil@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://originkorea.vercel.app';

interface NotificationPayload {
  type: 'new_registration' | 'registration_approved' | 'price_alert';
  data: Record<string, unknown>;
}

// Send email using Resend API (or fallback to logging)
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // If Resend API key is configured, use it
  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Origin Korea <noreply@originkorea.com>',
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        return { success: false, error };
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return { success: true, id: result.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }
  }

  // Fallback: Log the email (for development or when no email service is configured)
  console.log('=== EMAIL NOTIFICATION ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html);
  console.log('========================');

  return { success: true, logged: true };
}

// Generate email HTML for new registration
function generateRegistrationEmailHtml(data: {
  email: string;
  display_name: string;
  phone?: string;
  reason: string;
  referral_source?: string;
  timestamp: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>새 회원가입 신청</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #18181b; color: #ffffff; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #27272a; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">
            <span style="color: #ffffff;">ORIGIN</span>
            <span style="color: #fafafa;">KOREA</span>
          </h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">새 회원가입 신청</p>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <div style="background-color: #3f3f46; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #22d3ee;">신청자 정보</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa; width: 100px;">이메일</td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa;">닉네임</td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.display_name}</td>
              </tr>
              ${data.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa;">연락처</td>
                <td style="padding: 8px 0; color: #ffffff;">${data.phone}</td>
              </tr>
              ` : ''}
              ${data.referral_source ? `
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa;">가입 경로</td>
                <td style="padding: 8px 0; color: #ffffff;">${data.referral_source}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa;">신청 시간</td>
                <td style="padding: 8px 0; color: #ffffff;">${new Date(data.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #3f3f46; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #a1a1aa;">가입 사유</h3>
            <p style="margin: 0; color: #ffffff; line-height: 1.6;">${data.reason}</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center;">
            <a href="${SITE_URL}/admin/registrations"
               style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              관리자 페이지에서 확인하기
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; background-color: #1f1f23; text-align: center; font-size: 12px; color: #71717a;">
          <p style="margin: 0;">© 2026 Origin Korea. 금융 주권의 시대를 깨우다.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const body: NotificationPayload = await request.json();
    const { type, data } = body;

    if (type === 'new_registration') {
      const emailHtml = generateRegistrationEmailHtml({
        email: data.email as string,
        display_name: data.display_name as string,
        phone: data.phone as string | undefined,
        reason: data.reason as string,
        referral_source: data.referral_source as string | undefined,
        timestamp: data.timestamp as string || new Date().toISOString(),
      });

      const result = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[Origin Korea] 새 회원가입 신청 - ${data.display_name}`,
        html: emailHtml,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
