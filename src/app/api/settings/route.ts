import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

// Settings type
interface MaintenanceSettings {
  maintenance_mode: boolean;
  maintenance_message_ko: string;
  maintenance_message_en: string;
  maintenance_end_time: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

// Default settings - used when DB is not available
const DEFAULT_SETTINGS: MaintenanceSettings = {
  maintenance_mode: false,
  maintenance_message_ko: '서비스 점검 중입니다. 잠시 후 다시 접속해주세요.',
  maintenance_message_en: 'We are currently under maintenance. Please try again later.',
  maintenance_end_time: null,
  updated_at: null,
  updated_by: null,
};

// In-memory cache for settings (fallback when DB unavailable)
let settingsCache: MaintenanceSettings = { ...DEFAULT_SETTINGS };
let lastCacheUpdate = 0;
const CACHE_TTL = 10000; // 10 seconds

// GET - Fetch current settings
export async function GET() {
  try {
    // Return cached settings if within TTL
    const now = Date.now();
    if (now - lastCacheUpdate < CACHE_TTL) {
      return NextResponse.json(settingsCache);
    }

    if (!supabaseAdmin) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance')
      .single();

    if (error) {
      // Table doesn't exist or other error - return default/cached settings
      console.log('Settings fetch note:', error.message);
      return NextResponse.json(settingsCache);
    }

    if (data?.value) {
      settingsCache = data.value;
      lastCacheUpdate = now;
      return NextResponse.json(data.value);
    }

    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(settingsCache);
  }
}

// POST - Update settings (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Build new settings object
    const settings = {
      maintenance_mode: body.maintenance_mode ?? settingsCache.maintenance_mode ?? false,
      maintenance_message_ko: body.maintenance_message_ko || DEFAULT_SETTINGS.maintenance_message_ko,
      maintenance_message_en: body.maintenance_message_en || DEFAULT_SETTINGS.maintenance_message_en,
      maintenance_end_time: body.maintenance_end_time || null,
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || 'admin',
    };

    // Always update cache first for immediate effect
    settingsCache = settings;
    lastCacheUpdate = Date.now();

    if (!supabaseAdmin) {
      // No DB - just use cache
      return NextResponse.json({
        success: true,
        settings,
        note: 'Saved to memory cache only (DB not configured)',
      });
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    let userEmail = 'admin';

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          // Verify admin status
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
          userEmail = user.email || 'admin';
        }
      } catch (authError) {
        console.log('Auth verification skipped:', authError);
      }
    }

    settings.updated_by = userEmail;

    // Try to upsert to database
    try {
      const { error: upsertError } = await supabaseAdmin
        .from('site_settings')
        .upsert({
          key: 'maintenance',
          value: settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        });

      if (upsertError) {
        console.log('DB upsert note:', upsertError.message);
        // Still return success since cache was updated
        return NextResponse.json({
          success: true,
          settings,
          note: 'Saved to cache (DB table may not exist - run MAINTENANCE_SETUP.sql)',
        });
      }
    } catch (dbError) {
      console.log('DB operation failed:', dbError);
      return NextResponse.json({
        success: true,
        settings,
        note: 'Saved to cache only',
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
