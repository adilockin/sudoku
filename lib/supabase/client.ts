import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing (e.g. during build or before configuration),
  // return a mock object to prevent the app from crashing.
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        onAuthStateChange: () => ({ 
          data: { subscription: { unsubscribe: () => {} } } 
        }),
        signInWithPassword: async () => ({ data: {}, error: new Error("Supabase not configured") }),
        signUp: async () => ({ data: {}, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
      }
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
