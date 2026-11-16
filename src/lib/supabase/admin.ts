import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for trusted server-side operations (order creation,
 * payment status updates, fulfillment). NEVER import from client code —
 * the service-role key bypasses RLS and must not reach the browser.
 */
export function getSupabaseAdminClient() {
  const url = (process.env.NEXT_PUBLIC_RUMAHYA_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = (process.env.NEXT_PUBLIC_RUMAHYA_URL ? process.env.RUMAHYA_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      db: { schema: "boutique" },
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (error) {
    console.warn("Invalid Supabase admin client configuration:", error);
    return null;
  }
}
