"use client";

/**
 * Browser-side helpers for the password-gated workshop. All admin data
 * flows through /api/admin/* routes — the browser never holds a Supabase
 * credential. A 503 with `no-admin-client` means the server is missing
 * SUPABASE_SERVICE_ROLE_KEY.
 */
export type AdminError = "unauthorized" | "no-admin-client" | "error";

export interface DbRequest {
  table: string;
  action: "select" | "update" | "count";
  columns?: string[];
  filters?: { column: string; op: "eq" | "in"; value: unknown }[];
  order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  limit?: number;
  id?: string;
  patch?: Record<string, unknown>;
}

export async function adminDb<T = unknown>(
  body: DbRequest,
): Promise<
  | { ok: true; rows?: T[]; count?: number }
  | { ok: false; error: AdminError }
> {
  try {
    const res = await fetch("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) return { ok: false, error: "unauthorized" };
    if (res.status === 503) return { ok: false, error: "no-admin-client" };
    if (!res.ok) return { ok: false, error: "error" };
    const json = await res.json();
    return { ok: true, rows: json.rows, count: json.count };
  } catch {
    return { ok: false, error: "error" };
  }
}
