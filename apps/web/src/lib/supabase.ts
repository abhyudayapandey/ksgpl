"use client";

import { createSupabaseClient, type SupabaseClient } from "@ksgpl/shared";

let client: SupabaseClient | null = null;

/** Lazily-created singleton browser Supabase client, shared across client components. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    });
  }
  return client;
}
