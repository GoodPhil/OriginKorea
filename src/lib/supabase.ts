import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string;
          category: string;
          name_ko: string;
          name_en: string;
          url: string;
          order_num: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>;
      };
      page_permissions: {
        Row: {
          id: string;
          page_path: string;
          name_ko: string;
          name_en: string;
          description_ko: string | null;
          description_en: string | null;
          is_public: boolean;
          requires_auth: boolean;
          requires_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['page_permissions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['page_permissions']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          is_admin: boolean;
          push_subscription: object | null;
          price_alert_enabled: boolean;
          price_alert_threshold: number;
          current_session_id: string | null;
          session_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>>;
      };
      announcements: {
        Row: {
          id: string;
          title_ko: string;
          title_en: string;
          content_ko: string | null;
          content_en: string | null;
          type: string;
          is_push_sent: boolean;
          is_active: boolean;
          scheduled_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          price_at_alert: number;
          previous_price: number;
          change_percent: number;
          alert_type: string;
          is_sent: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['price_alerts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['price_alerts']['Insert']>;
      };
    };
  };
};

// Supabase 클라이언트 생성 (환경 변수가 없으면 null 반환)
export const supabase: SupabaseClient<Database> | null =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

// Helper function to get supabase client (throws if not configured)
export function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}
