import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Supabase not configured',
        users: { total: 0, admins: 0, newThisWeek: 0, newThisMonth: 0 },
        registrations: { pending: 0, approvedThisWeek: 0, rejectedThisWeek: 0 },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, display_name, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({
        error: usersError.message,
        users: { total: 0, admins: 0, newThisWeek: 0, newThisMonth: 0 },
        registrations: { pending: 0, approvedThisWeek: 0, rejectedThisWeek: 0 },
      });
    }

    const allUsers = users || [];
    const totalUsers = allUsers.length;
    const admins = allUsers.filter(u => u.is_admin).length;
    const newThisWeek = allUsers.filter(u => new Date(u.created_at) > weekAgo).length;
    const newThisMonth = allUsers.filter(u => new Date(u.created_at) > monthAgo).length;
    const newToday = allUsers.filter(u => new Date(u.created_at) > todayStart).length;

    // Fetch pending registrations
    let pendingRegistrations = 0;
    let approvedThisWeek = 0;
    let rejectedThisWeek = 0;

    try {
      const { data: pendingRegs } = await supabase
        .from('registrations')
        .select('id')
        .eq('status', 'pending');
      pendingRegistrations = pendingRegs?.length || 0;

      const { data: approvedRegs } = await supabase
        .from('registrations')
        .select('id, updated_at')
        .eq('status', 'approved')
        .gte('updated_at', weekAgo.toISOString());
      approvedThisWeek = approvedRegs?.length || 0;

      const { data: rejectedRegs } = await supabase
        .from('registrations')
        .select('id, updated_at')
        .eq('status', 'rejected')
        .gte('updated_at', weekAgo.toISOString());
      rejectedThisWeek = rejectedRegs?.length || 0;
    } catch (regError) {
      console.log('Registrations table may not exist:', regError);
    }

    // Recent users list (last 10)
    const recentUsers = allUsers.slice(0, 10).map(u => ({
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      is_admin: u.is_admin,
      created_at: u.created_at,
    }));

    // User growth data (last 7 days)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const count = allUsers.filter(u => {
        const createdAt = new Date(u.created_at);
        return createdAt >= dayStart && createdAt < dayEnd;
      }).length;

      userGrowth.push({
        date: dayStart.toISOString().split('T')[0],
        count,
      });
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        admins,
        regularUsers: totalUsers - admins,
        newThisWeek,
        newThisMonth,
        newToday,
      },
      registrations: {
        pending: pendingRegistrations,
        approvedThisWeek,
        rejectedThisWeek,
      },
      recentUsers,
      userGrowth,
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
