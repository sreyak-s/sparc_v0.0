import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  (supabaseServiceKey || supabaseAnonKey) &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
);

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseAdminInstance && supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!);
  }
  return supabaseAdminInstance;
}
