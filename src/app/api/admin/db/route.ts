import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/adminSession";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Constrained data proxy for the password-gated workshop. The browser
 * never talks to Supabase directly for admin work: it posts here, the
 * session cookie is checked, and the service-role client runs a query
 * limited to the allowlisted tables, columns and operations below.
 */
const TABLES: Record<
  string,
  { read: string[]; write: string[]; filter: string[] }
> = {
  illustrations: {
    read: [
      "id",
      "slug",
      "title",
      "status",
      "featured",
      "featured_order",
      "is_placeholder",
    ],
    write: ["status", "featured", "featured_order"],
    filter: ["status"],
  },
  orders: {
    read: [
      "id",
      "ref",
      "email",
      "status",
      "total_cents",
      "payment_provider",
      "fulfillment_provider",
      "created_at",
    ],
    write: ["status"],
    filter: ["status"],
  },
  contact_messages: {
    read: ["id", "name", "email", "message", "handled", "created_at"],
    write: ["handled"],
    filter: ["handled"],
  },
  newsletter_subscribers: {
    read: ["id", "email", "locale", "created_at"],
    write: [],
    filter: [],
  },
};

interface Filter {
  column: string;
  op: "eq" | "in";
  value: unknown;
}
interface Order {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

export async function POST(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "no-admin-client" }, { status: 503 });
  }

  let body: {
    table?: string;
    action?: string;
    columns?: string[];
    filters?: Filter[];
    order?: Order[];
    limit?: number;
    id?: string;
    patch?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const spec = body.table ? TABLES[body.table] : undefined;
  if (!spec || !body.table) {
    return NextResponse.json({ error: "bad-table" }, { status: 400 });
  }
  const table = body.table;
  const filters = (body.filters ?? []).filter(
    (f) => spec.filter.includes(f.column) && (f.op === "eq" || f.op === "in"),
  );

  if (body.action === "count") {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    for (const f of filters) {
      q = f.op === "eq" ? q.eq(f.column, f.value) : q.in(f.column, f.value as unknown[]);
    }
    const { count, error } = await q;
    if (error) return NextResponse.json({ error: "query" }, { status: 500 });
    return NextResponse.json({ count: count ?? 0 });
  }

  if (body.action === "select") {
    const columns = (body.columns ?? spec.read).filter((c) =>
      spec.read.includes(c),
    );
    if (columns.length === 0) {
      return NextResponse.json({ error: "bad-columns" }, { status: 400 });
    }
    let q = supabase.from(table).select(columns.join(", "));
    for (const f of filters) {
      q = f.op === "eq" ? q.eq(f.column, f.value) : q.in(f.column, f.value as unknown[]);
    }
    for (const o of body.order ?? []) {
      if (spec.read.includes(o.column)) {
        q = q.order(o.column, {
          ascending: o.ascending ?? true,
          nullsFirst: o.nullsFirst,
        });
      }
    }
    q = q.limit(Math.min(Math.max(body.limit ?? 200, 1), 1000));
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: "query" }, { status: 500 });
    return NextResponse.json({ rows: data ?? [] });
  }

  if (body.action === "update") {
    if (!body.id || !body.patch) {
      return NextResponse.json({ error: "bad-request" }, { status: 400 });
    }
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body.patch)) {
      if (spec.write.includes(k)) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "bad-columns" }, { status: 400 });
    }
    const { error } = await supabase.from(table).update(patch).eq("id", body.id);
    if (error) return NextResponse.json({ error: "query" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad-action" }, { status: 400 });
}
