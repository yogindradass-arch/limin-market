import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are missing (for development)
// The app will still work for UI testing, but Supabase features won't function
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'your-project-url.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here');

// Log warning in development if not configured
if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn('⚠️ Supabase is not configured. Update your .env file with valid credentials.');
}
