import "server-only";

import {
  celebrations,
  collections,
  illustrations,
  personalizationTemplates,
  products,
} from "./data";
import type {
  CelebrationCategory,
  Collection,
  Illustration,
  PersonalizationTemplate,
  ProductType,
} from "./types";
import type { Locale } from "@/lib/i18n/config";

/* ---------------------------------------------------------------------------
   Catalogue access layer.

   Today this reads the local catalogue (data.ts), which is also what seeds
   Supabase. Once Supabase holds the live catalogue, swap the internals of
   these functions for Supabase queries (the shapes already match the schema
   in /supabase/schema.sql) — every page goes through this module only.
--------------------------------------------------------------------------- */

export async function getIllustrations(filter?: {
  collection?: string;
  celebration?: string;
  personalizable?: boolean;
}): Promise<Illustration[]> {
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
  return illustrations
    .filter((i) => i.status === "published" && i.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
    .slice(0, 6);
}

export async function getIllustration(
  slug: string,
): Promise<Illustration | null> {
  return (
    illustrations.find((i) => i.slug === slug && i.status === "published") ??
    null
  );
}

export async function getRelatedIllustrations(
  illustration: Illustration,
  count = 3,
): Promise<Illustration[]> {
  const scored = illustrations
    .filter(
      (i) => i.status === "published" && i.slug !== illustration.slug,
    )
    .map((i) => {
      const sharedCollections = i.collections.filter((c) =>
        illustration.collections.includes(c),
      ).length;
      const sharedCelebrations = i.celebrations.filter((c) =>
        illustration.celebrations.includes(c),
      ).length;
      return { i, score: sharedCollections * 2 + sharedCelebrations };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.i);
}

export async function getCollections(): Promise<Collection[]> {
  return [...collections].sort((a, b) => a.order - b.order);
}

export async function getCollection(slug: string): Promise<Collection | null> {
  return collections.find((c) => c.slug === slug) ?? null;
}

export async function getCelebrations(): Promise<CelebrationCategory[]> {
  return [...celebrations].sort((a, b) => a.order - b.order);
}

export async function getCelebration(
  slug: string,
): Promise<CelebrationCategory | null> {
  return celebrations.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(): Promise<ProductType[]> {
  return [...products].sort((a, b) => a.order - b.order);
}

export async function getProductsForIllustration(
  illustration: Illustration,
): Promise<ProductType[]> {
  return products
    .filter((p) => illustration.productSlugs.includes(p.slug))
    .sort((a, b) => a.order - b.order);
}

export function getPersonalizationTemplate(
  id: string | null,
): PersonalizationTemplate | null {
  if (!id) return null;
  return personalizationTemplates.find((t) => t.id === id) ?? null;
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
export function resolveVariantPrice(
  productSlug: string,
  variantId: string,
): { priceCents: number; productName: ProductType["name"] } | null {
  const product = products.find((p) => p.slug === productSlug);
  const variant = product?.variants.find(
    (v) => v.id === variantId && v.available,
  );
  if (!product || !variant) return null;
  return { priceCents: variant.priceCents, productName: product.name };
}

export { products, collections, celebrations, illustrations, personalizationTemplates };
