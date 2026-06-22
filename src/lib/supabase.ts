import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const hasValidSupabaseUrl = supabaseUrl?.startsWith("http://") || supabaseUrl?.startsWith("https://")

if (!hasValidSupabaseUrl || !supabaseAnonKey) {
  console.error("Missing or invalid Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
}

const resolvedSupabaseUrl = hasValidSupabaseUrl && supabaseUrl ? supabaseUrl : "https://placeholder.supabase.co"
const resolvedSupabaseAnonKey = supabaseAnonKey || "placeholder-anon-key"

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  global: {
    fetch: (url, options) => {
      return fetch(url, { ...options, cache: 'no-store' });
    }
  }
});
