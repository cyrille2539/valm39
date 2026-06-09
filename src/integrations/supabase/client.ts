import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

declare global {
  // eslint-disable-next-line no-var
  var _supabaseSingleton: SupabaseClient<Database> | undefined;
}

// Singleton : évite les instances multiples avec Turbopack (hot-reload) et React StrictMode
// qui déclenchent une race condition sur le verrou d'auth localStorage
export const supabase: SupabaseClient<Database> =
  globalThis._supabaseSingleton ??
  (globalThis._supabaseSingleton = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  ));
