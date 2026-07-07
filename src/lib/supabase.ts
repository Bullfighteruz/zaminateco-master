import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only if configuration is provided
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-project-url'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is active
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
