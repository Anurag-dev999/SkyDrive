import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Create .env.local and add:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>'
  )
}

/**
 * Singleton Supabase client used throughout the application.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * to be set in .env.local.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
