/**
 * Central place to know whether Supabase is wired up.
 * The whole storefront works without it (local catalogue, localStorage cart
 * and favorites); auth, server-side orders and account features light up
 * once these variables exist.
 */
import { createClient } from "@supabase/supabase-js";

// Infer the library's ungenerated database type with the custom schema.
export function createStatelessSupabaseClient(url: string, key: string) {
  return createClient(url, key, {
    db: { schema: supabaseSchema },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export type AppSupabaseClient = ReturnType<typeof createStatelessSupabaseClient>;
export const supabaseSchema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "mlle_labeille";
export const supabaseCookieOptions = { name: "mlle-labeille-auth" };

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
