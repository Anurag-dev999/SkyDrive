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
 *
 * The custom `lock` bypasses the Navigator LockManager that Supabase JS v2
 * uses to synchronise auth-token access across browser tabs. On some
 * browsers / environments that lock times out after 10 s, blocking every
 * Supabase call (auth, storage, database). Running the callback directly
 * is the officially recommended workaround for single-tab SPAs.
 * See: https://github.com/supabase/supabase-js/issues/1037
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> =>
      fn(),
  },
})
