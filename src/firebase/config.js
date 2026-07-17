import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Sanitize: remove any non-JWT prefix (e.g. "N_KEY\t") that may have been pasted by mistake
function sanitizeSupabaseKey(key) {
  const jwtIndex = key.indexOf('eyJ');
  if (jwtIndex > 0) return key.slice(jwtIndex);
  return key;
}

const supabaseUrl = rawUrl;
const supabaseAnonKey = sanitizeSupabaseKey(rawKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const db = supabase;
export const auth = supabase.auth;

export default supabase;
