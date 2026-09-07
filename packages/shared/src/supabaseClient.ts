import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Both apps (web + mobile) read env vars with different prefixes
 * (NEXT_PUBLIC_* vs EXPO_PUBLIC_*), so each app resolves its own env
 * and passes it here rather than this package reading process.env directly.
 */
export function createSupabaseClient(
  env: SupabaseEnv,
  storage?: any
): SupabaseClient {
  if (!env.url || !env.anonKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env(.local) and fill in your project URL + anon key."
    );
  }

  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      ...(storage ? { storage } : {}),
    },
  });
}

export type { SupabaseClient };
