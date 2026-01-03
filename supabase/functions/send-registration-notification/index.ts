// Supabase Edge Function: send-registration-notification
// 회원가입 신청 시 관리자에게 이메일 알림을 전송합니다.
//
// 배포 방법:
// 1. Supabase CLI 설치: npm install -g supabase
// 2. 프로젝트 연결: supabase link --project-ref YOUR_PROJECT_REF
// 3. 함수 배포: supabase functions deploy send-registration-notification
// 4. 환경변수 설정: supabase secrets set RESEND_API_KEY=your_resend_api_key

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'Origin Korea <noreply@originkorea.kr>';

interface RegistrationData {
  adminEmail: string;
  applicant: {
    email: string;
    display_name: string;
    phone?: string;
    reason: string;
    referral_source?: string;
  };
  timestamp: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: RegistrationData = await req.json();
    const { adminEmail, applicant, timestamp } = data;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the date
    const formattedDate = new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>새 회원가입 신청</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .info-box { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
    .info-row { display: flex; border-bottom: 1px solid #f3f4f6; padding: 12px 0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #6b7280; min-width: 100px; }
    .info-value { color: #111827; flex: 1; }
    .reason-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 20px; }
    .reason-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
    .reason-text { color: #78350f; }
    .action-btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 새 회원가입 신청</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Origin Korea에 새로운 가입 신청이 접수되었습니다</p>
    </div>

    <div class="content">
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">이메일</span>
          <span class="info-value">${applicant.email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">닉네임</span>
          <span class="info-value">${applicant.display_name}</span>
        </div>
        ${applicant.phone ? `
        <div class="info-row">
          <span class="info-label">연락처</span>
          <span class="info-value">${applicant.phone}</span>
        </div>
        ` : ''}
        ${applicant.referral_source ? `
        <div class="info-row">
          <span class="info-label">유입 경로</span>
          <span class="info-value">${applicant.referral_source}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">신청 시간</span>
          <span class="info-value">${formattedDate}</span>
        </div>
      </div>

      <div class="reason-box">
        <div class="reason-title">📝 가입 사유</div>
        <div class="reason-text">${applicant.reason}</div>
      </div>

      <center>
        <a href="https://originkorea.kr/admin/registrations" class="action-btn">
          가입 신청 관리 →
        </a>
      </center>
    </div>

    <div class="footer">
      <p>이 메일은 Origin Korea 관리자에게 자동 발송되었습니다.</p>
      <p>© 2026 Origin Korea. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: `[Origin Korea] 새 회원가입 신청: ${applicant.display_name}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
