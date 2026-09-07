import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient, type SupabaseClient } from "@ksgpl/shared";

let client: SupabaseClient | null = null;

/** Lazily-created singleton Supabase client, shared across screens. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
      },
      AsyncStorage
    );
  }
  return client;
}
