import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/adminSession";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { bustCatalogueCache } from "@/lib/catalogue";

export const runtime = "nodejs";

/**
 * Full CRUD for collections, password-gated. Every field of the table is
 * editable: brand name, slug, FR/EN subtitle & description, colours,
 * cover illustration, ordering and SEO copy. After each mutation the
 * in-memory catalogue snapshot is dropped and the site revalidated, so
 * the boutique reflects the change on the next visit.
 */

interface Localized {
  fr?: string;
  en?: string;
}
interface CollectionInput {
  slug?: string;
  name?: string;
  subtitle?: Localized;
  description?: Localized;
  accent_color?: string | null;
  tint_color?: string | null;
  cover_illustration_slug?: string | null;
  sort_order?: number;
  seo_title?: Localized;
  seo_description?: Localized;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cleanLocalized(value: Localized | undefined): Localized {
  const out: Localized = {};
  if (typeof value?.fr === "string") out.fr = value.fr.trim();
  if (typeof value?.en === "string") out.en = value.en.trim();
  return out;
}

function collectionPatch(input: CollectionInput): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) {
    patch.name = input.name.trim();
  }
  if (typeof input.slug === "string" && input.slug.trim()) {
    const slug = slugify(input.slug);
    if (slug) patch.slug = slug;
  }
  if (input.subtitle) patch.subtitle = cleanLocalized(input.subtitle);
  if (input.description) patch.description = cleanLocalized(input.description);
  if ("accent_color" in input) patch.accent_color = input.accent_color || null;
  if ("tint_color" in input) patch.tint_color = input.tint_color || null;
  if ("cover_illustration_slug" in input) {
    patch.cover_illustration_slug = input.cover_illustration_slug || null;
  }
  if (typeof input.sort_order === "number" && Number.isFinite(input.sort_order)) {
    patch.sort_order = Math.round(input.sort_order);
  }
  if (input.seo_title) patch.seo_title = cleanLocalized(input.seo_title);
  if (input.seo_description) {
    patch.seo_description = cleanLocalized(input.seo_description);
  }
  return patch;
}

function refreshSite() {
  bustCatalogueCache();
  revalidatePath("/", "layout");
}

async function guard() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ configured: false });

  const [collections, illustrations] = await Promise.all([
    supabase
      .from("collections")
      .select(
        "id, slug, name, subtitle, description, accent_color, tint_color, cover_illustration_slug, sort_order, seo_title, seo_description",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("illustrations")
      .select("slug, title")
      .order("slug", { ascending: true }),
  ]);
  if (collections.error || illustrations.error) {
    return NextResponse.json({ error: "query" }, { status: 500 });
  }
  return NextResponse.json({
    configured: true,
    collections: collections.data ?? [],
    illustrations: illustrations.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "no-admin-client" }, { status: 503 });
  }

  let input: CollectionInput;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const name = input.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name-required" }, { status: 400 });
  }
  const patch = collectionPatch(input);
  patch.name = name;
  if (!patch.slug) patch.slug = slugify(name);
  if (!patch.slug) {
    return NextResponse.json({ error: "slug-required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("collections")
    .insert(patch)
    .select("id")
    .single();
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "slug-taken" : "query" },
      { status },
    );
  }
  refreshSite();
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PUT(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "no-admin-client" }, { status: 503 });
  }

  let input: CollectionInput & { id?: string };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  if (!input.id) {
    return NextResponse.json({ error: "id-required" }, { status: 400 });
  }
  const patch = collectionPatch(input);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "empty-patch" }, { status: 400 });
  }
  const { error } = await supabase
    .from("collections")
    .update(patch)
    .eq("id", input.id);
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "slug-taken" : "query" },
      { status },
    );
  }
  refreshSite();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "no-admin-client" }, { status: 503 });
  }

  let id = "";
  try {
    const body = await request.json();
    id = typeof body?.id === "string" ? body.id : "";
  } catch {
    /* handled below */
  }
  if (!id) return NextResponse.json({ error: "id-required" }, { status: 400 });

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "query" }, { status: 500 });
  refreshSite();
  return NextResponse.json({ ok: true });
}
