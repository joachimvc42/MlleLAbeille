/**
 * Central place to know whether Supabase is wired up.
 * The whole storefront works without it (local catalogue, localStorage cart
 * and favorites); auth, server-side orders and account features light up
 * once these variables exist.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
