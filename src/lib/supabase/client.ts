"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let failed = false;

/**
 * Browser Supabase client, or null when the project is not configured OR
 * the configured URL/key is invalid. Never throws — an env var typo must
 * degrade to "Supabase not configured", not crash prerendering.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (failed) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    client ??= createBrowserClient(url, key);
    return client;
  } catch (error) {
    failed = true;
    console.warn("Invalid Supabase browser client configuration:", error);
    return null;
  }
}
