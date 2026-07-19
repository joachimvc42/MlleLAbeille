import "server-only";

import {
  celebrations as localCelebrations,
  collections as localCollections,
  illustrations as localIllustrations,
  personalizationTemplates as localTemplates,
  products as localProducts,
} from "./data";
import {
  fetchSupabaseCatalogue,
  type CatalogueSnapshot,
} from "./supabase";
import type {
  CelebrationCategory,
  Collection,
  Illustration,
  PersonalizationTemplate,
  ProductType,
} from "./types";
import type { Locale } from "@/lib/i18n/config";

/* ---------------------------------------------------------------------------
   Catalogue access layer — the ONLY module pages read data from.

   With Supabase configured and seeded, the live catalogue comes from the
   database (so the admin interface is authoritative); otherwise the local
   catalogue in data.ts serves as a complete, honest fallback for
   development and demos.
--------------------------------------------------------------------------- */

const localSnapshot: CatalogueSnapshot = {
  source: "local",
  illustrations: localIllustrations,
  collections: localCollections,
  celebrations: localCelebrations,
  products: localProducts,
  templates: localTemplates,
};

const SNAPSHOT_TTL_MS = 60_000;
let cached: CatalogueSnapshot | null = null;
let cachedAt = 0;

/** Drops the in-memory snapshot so the next read refetches Supabase —
 * called after admin catalogue mutations alongside revalidatePath. */
export function bustCatalogueCache() {
  cached = null;
  cachedAt = 0;
}

export async function getSnapshot(): Promise<CatalogueSnapshot> {
  const now = Date.now();
  if (cached && now - cachedAt < SNAPSHOT_TTL_MS) return cached;

  try {
    const remote = await fetchSupabaseCatalogue();
    cached = remote ?? localSnapshot;
  } catch (error) {
    console.warn("Falling back to local catalogue:", error);
    cached = localSnapshot;
  }
  cachedAt = now;
  return cached;
}

/* ------------------------------ Illustrations ---------------------------- */

export async function getIllustrations(filter?: {
  collection?: string;
  celebration?: string;
  personalizable?: boolean;
}): Promise<Illustration[]> {
  const { illustrations } = await getSnapshot();
  let list = illustrations.filter((i) => i.status === "published");
  if (filter?.collection) {
    list = list.filter((i) => i.collections.includes(filter.collection!));
  }
  if (filter?.celebration) {
    list = list.filter((i) => i.celebrations.includes(filter.celebration!));
  }
  if (filter?.personalizable) {
    list = list.filter((i) => i.personalizationTemplateId !== null);
  }
  return list;
}

export async function getFeaturedIllustrations(): Promise<Illustration[]> {
  const { illustrations } = await getSnapshot();
  return illustrations
    .filter((i) => i.status === "published" && i.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
    .slice(0, 6);
}

export async function getIllustration(
  slug: string,
): Promise<Illustration | null> {
  const { illustrations } = await getSnapshot();
  return (
    illustrations.find((i) => i.slug === slug && i.status === "published") ??
    null
  );
}

export async function getRelatedIllustrations(
  illustration: Illustration,
  count = 3,
): Promise<Illustration[]> {
  const { illustrations } = await getSnapshot();
  return illustrations
    .filter((i) => i.status === "published" && i.slug !== illustration.slug)
    .map((i) => {
      const sharedCollections = i.collections.filter((c) =>
        illustration.collections.includes(c),
      ).length;
      const sharedCelebrations = i.celebrations.filter((c) =>
        illustration.celebrations.includes(c),
      ).length;
      return { i, score: sharedCollections * 2 + sharedCelebrations };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.i);
}

/* ------------------------- Collections & celebrations -------------------- */

export async function getCollections(): Promise<Collection[]> {
  const { collections } = await getSnapshot();
  return [...collections].sort((a, b) => a.order - b.order);
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const { collections } = await getSnapshot();
  return collections.find((c) => c.slug === slug) ?? null;
}

export async function getCelebrations(): Promise<CelebrationCategory[]> {
  const { celebrations } = await getSnapshot();
  return [...celebrations].sort((a, b) => a.order - b.order);
}

export async function getCelebration(
  slug: string,
): Promise<CelebrationCategory | null> {
  const { celebrations } = await getSnapshot();
  return celebrations.find((c) => c.slug === slug) ?? null;
}

/* --------------------------------- Products ------------------------------ */

export async function getProducts(): Promise<ProductType[]> {
  const { products } = await getSnapshot();
  return [...products].sort((a, b) => a.order - b.order);
}

export async function getProductsForIllustration(
  illustration: Illustration,
): Promise<ProductType[]> {
  const { products } = await getSnapshot();
  return products
    .filter((p) => illustration.productSlugs.includes(p.slug))
    .sort((a, b) => a.order - b.order);
}

export async function getPersonalizationTemplate(
  id: string | null,
): Promise<PersonalizationTemplate | null> {
  if (!id) return null;
  const { templates } = await getSnapshot();
  return templates.find((t) => t.id === id) ?? null;
}

/* ------------------------------- Search ---------------------------------- */

export interface SearchResults {
  illustrations: Illustration[];
  collections: Collection[];
  celebrations: CelebrationCategory[];
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export async function searchCatalogue(
  query: string,
  locale: Locale,
): Promise<SearchResults> {
  const q = normalize(query.trim());
  if (q.length < 2) {
    return { illustrations: [], collections: [], celebrations: [] };
  }
  const { illustrations, collections, celebrations } = await getSnapshot();

  const matchText = (...candidates: string[]) =>
    candidates.some((c) => normalize(c).includes(q));

  const foundCelebrations = celebrations.filter((c) =>
    matchText(c.name[locale], c.name.fr, c.description[locale], c.slug),
  );
  const foundCollections = collections.filter((c) =>
    matchText(c.name, c.subtitle[locale], c.description[locale], c.slug),
  );

  const celebrationSlugs = new Set(foundCelebrations.map((c) => c.slug));
  const collectionSlugs = new Set(foundCollections.map((c) => c.slug));

  const foundIllustrations = illustrations.filter(
    (i) =>
      i.status === "published" &&
      (matchText(
        i.title[locale],
        i.title.fr,
        i.description[locale],
        i.slug,
        ...i.tags.map((t) => t[locale]),
        ...i.tags.map((t) => t.fr),
      ) ||
        i.celebrations.some((slug) => celebrationSlugs.has(slug)) ||
        i.collections.some((slug) => collectionSlugs.has(slug))),
  );

  return {
    illustrations: foundIllustrations,
    collections: foundCollections,
    celebrations: foundCelebrations,
  };
}

/* -------------------------- Pricing (server-side) ------------------------ */

/**
 * Resolve the authoritative unit price of a (product, variant) pair.
 * Cart totals and checkout ALWAYS go through this — client prices are
 * treated as display hints only.
 */
export async function resolveVariantPrice(
  productSlug: string,
  variantId: string,
): Promise<{ priceCents: number; productName: ProductType["name"] } | null> {
  const { products } = await getSnapshot();
  const product = products.find((p) => p.slug === productSlug);
  const variant = product?.variants.find(
    (v) => v.id === variantId && v.available,
  );
  if (!product || !variant) return null;
  return { priceCents: variant.priceCents, productName: product.name };
}

/** Printify references of a variant (for fulfillment). */
export async function resolvePrintifyRefs(
  productSlug: string,
  variantId: string,
): Promise<ProductType["variants"][number]["printify"] | null> {
  const { products } = await getSnapshot();
  const variant = products
    .find((p) => p.slug === productSlug)
    ?.variants.find((v) => v.id === variantId);
  return variant?.printify ?? null;
}
