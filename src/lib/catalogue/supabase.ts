import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { LocalizedText } from "@/lib/i18n/config";
import type {
  CelebrationCategory,
  Collection,
  Illustration,
  PersonalizationField,
  PersonalizationTemplate,
  ProductType,
} from "./types";

/* ---------------------------------------------------------------------------
   Supabase catalogue reader.

   Loads the whole published catalogue through the anon key (RLS allows
   public read of published content only) and maps rows to the domain
   types used everywhere in the app. Consumed by index.ts, which falls
   back to the local catalogue when Supabase is absent, unreachable or
   not seeded yet.
--------------------------------------------------------------------------- */

export interface CatalogueSnapshot {
  source: "local" | "supabase";
  illustrations: Illustration[];
  collections: Collection[];
  celebrations: CelebrationCategory[];
  products: ProductType[];
  templates: PersonalizationTemplate[];
}

/** jsonb → LocalizedText with sensible fallbacks. */
function lt(value: unknown): LocalizedText {
  const v = (value ?? {}) as Record<string, string>;
  const fr = v.fr ?? "";
  return { fr, en: v.en ?? fr };
}

function ltOrUndefined(value: unknown): LocalizedText | undefined {
  if (!value) return undefined;
  return lt(value);
}

/* Row shapes (only the columns we select). */
interface VariantRow {
  id: string;
  name: unknown;
  price_cents: number;
  available: boolean;
  printify_blueprint_id: number | null;
  printify_print_provider_id: number | null;
  printify_variant_id: number | null;
  sort_order: number;
}

interface ProductRow {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  personalizable: boolean;
  sort_order: number;
  product_variants: VariantRow[];
}

interface FieldRow {
  key: string;
  field_type: PersonalizationField["type"];
  label: unknown;
  placeholder: unknown;
  required: boolean;
  max_length: number | null;
  min_value: number | null;
  max_value: number | null;
  options: unknown;
  show_in_preview: boolean;
  sort_order: number;
}

interface TemplateRow {
  id: string;
  name: unknown;
  personalization_fields: FieldRow[];
}

interface IllustrationRow {
  id: string;
  slug: string;
  title: unknown;
  description: unknown;
  alt_text: unknown;
  background_color: string | null;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  is_placeholder: boolean;
  tags: unknown;
  status: "draft" | "published";
  featured: boolean;
  featured_order: number | null;
  personalization_template_id: string | null;
  collection_illustrations: { collections: { slug: string } | null }[];
  celebration_illustrations: {
    celebration_categories: { slug: string } | null;
  }[];
  illustration_products: { products: { slug: string } | null }[];
}

export async function fetchSupabaseCatalogue(): Promise<CatalogueSnapshot | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [collectionsRes, celebrationsRes, productsRes, templatesRes, illustrationsRes] =
    await Promise.all([
      supabase
        .from("collections")
        .select(
          "id, slug, name, subtitle, description, accent_color, tint_color, cover_illustration_slug, sort_order",
        )
        .order("sort_order"),
      supabase
        .from("celebration_categories")
        .select("id, slug, name, description, icon, tint_color, sort_order")
        .order("sort_order"),
      supabase
        .from("products")
        .select(
          "id, slug, name, description, personalizable, sort_order, product_variants(id, name, price_cents, available, printify_blueprint_id, printify_print_provider_id, printify_variant_id, sort_order)",
        )
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("personalization_templates")
        .select("id, name, personalization_fields(*)"),
      supabase
        .from("illustrations")
        .select(
          `id, slug, title, description, alt_text, background_color, image_path,
           image_width, image_height, is_placeholder, tags, status, featured,
           featured_order, personalization_template_id,
           collection_illustrations ( collections ( slug ) ),
           celebration_illustrations ( celebration_categories ( slug ) ),
           illustration_products ( products ( slug ) )`,
        )
        .eq("status", "published"),
    ]);

  const failed =
    collectionsRes.error ??
    celebrationsRes.error ??
    productsRes.error ??
    templatesRes.error ??
    illustrationsRes.error;
  if (failed) {
    console.warn("Supabase catalogue unavailable:", failed.message);
    return null;
  }

  const illustrationRows =
    (illustrationsRes.data as unknown as IllustrationRow[]) ?? [];
  // An empty catalogue almost certainly means seed.sql has not run yet —
  // keep the storefront alive with the local catalogue instead.
  if (illustrationRows.length === 0) return null;

  const products: ProductType[] = (
    (productsRes.data as unknown as ProductRow[]) ?? []
  ).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: lt(row.name),
    description: lt(row.description),
    personalizable: row.personalizable,
    order: row.sort_order,
    variants: [...row.product_variants]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        name: lt(v.name),
        priceCents: v.price_cents,
        available: v.available,
        printify: {
          blueprintId: v.printify_blueprint_id,
          printProviderId: v.printify_print_provider_id,
          variantId: v.printify_variant_id,
        },
      })),
  }));

  const templates: PersonalizationTemplate[] = (
    (templatesRes.data as unknown as TemplateRow[]) ?? []
  ).map((row) => ({
    id: row.id,
    name: lt(row.name),
    fields: [...row.personalization_fields]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({
        key: f.key,
        type: f.field_type,
        label: lt(f.label),
        placeholder: ltOrUndefined(f.placeholder),
        required: f.required,
        maxLength: f.max_length ?? undefined,
        min: f.min_value ?? undefined,
        max: f.max_value ?? undefined,
        options: Array.isArray(f.options)
          ? (f.options as { value: string; label: unknown }[]).map((o) => ({
              value: o.value,
              label: lt(o.label),
            }))
          : undefined,
        showInPreview: f.show_in_preview,
      })),
  }));

  const collections: Collection[] = (collectionsRes.data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: lt(row.subtitle),
    description: lt(row.description),
    accent: row.accent_color ?? "#E3B351",
    tint: row.tint_color ?? "#FAF0D8",
    coverIllustrationSlug: row.cover_illustration_slug ?? "abeille-sereine",
    order: row.sort_order,
  }));

  const celebrations: CelebrationCategory[] = (celebrationsRes.data ?? []).map(
    (row) => ({
      id: row.id,
      slug: row.slug,
      name: lt(row.name),
      description: lt(row.description),
      icon: row.icon ?? "🐝",
      tint: row.tint_color ?? "#FAF0D8",
      order: row.sort_order,
    }),
  );

  const illustrations: Illustration[] = illustrationRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: lt(row.title),
    description: lt(row.description),
    image: {
      src: row.image_path ?? `/illustrations/${row.slug}/full.webp`,
      width: row.image_width ?? 2048,
      height: row.image_height ?? 2048,
      alt: lt(row.alt_text),
      background: row.background_color ?? "#FBF7DC",
      placeholder: row.is_placeholder,
    },
    collections: row.collection_illustrations
      .map((link) => link.collections?.slug)
      .filter((slug): slug is string => Boolean(slug)),
    celebrations: row.celebration_illustrations
      .map((link) => link.celebration_categories?.slug)
      .filter((slug): slug is string => Boolean(slug)),
    tags: Array.isArray(row.tags) ? (row.tags as unknown[]).map(lt) : [],
    featured: row.featured,
    featuredOrder: row.featured_order,
    personalizationTemplateId: row.personalization_template_id,
    productSlugs: row.illustration_products
      .map((link) => link.products?.slug)
      .filter((slug): slug is string => Boolean(slug)),
    status: row.status,
  }));

  return {
    source: "supabase",
    illustrations,
    collections,
    celebrations,
    products,
    templates,
  };
}
