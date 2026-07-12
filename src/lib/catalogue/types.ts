import type { LocalizedText } from "@/lib/i18n/config";

/* ---------------------------------------------------------------------------
   Catalogue domain model.

   The illustration is the primary creative product; physical supports
   (mug, print, card…) are secondary. This model mirrors the Supabase
   schema in /supabase/schema.sql — the local data in data.ts doubles as
   development fallback and seed source.
--------------------------------------------------------------------------- */

export type IllustrationStatus = "published" | "draft";

export interface IllustrationImage {
  /** Path under /public (or Supabase Storage URL in production). */
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  /** Dominant background colour of the artwork, used for cards & scenes. */
  background: string;
  /**
   * True while the original file has not been supplied yet and the site
   * shows a generated stand-in. See docs/ASSETS.md.
   */
  placeholder: boolean;
}

export interface Illustration {
  id: string;
  slug: string;
  title: LocalizedText;
  /** Short emotional/descriptive text shown on the detail page. */
  description: LocalizedText;
  image: IllustrationImage;
  /** Collection slugs (la-vie-en-jaune…). */
  collections: string[];
  /** Celebration slugs (naissance, anniversaire…). */
  celebrations: string[];
  /** Search keywords per locale. */
  tags: LocalizedText[];
  featured: boolean;
  featuredOrder: number | null;
  /** Personalization template id, when the design can be personalized. */
  personalizationTemplateId: string | null;
  /** Slugs of the product types this illustration is available on. */
  productSlugs: string[];
  status: IllustrationStatus;
}

export interface Collection {
  id: string;
  slug: string;
  /** Collection names stay in French in every locale (brand names). */
  name: string;
  subtitle: LocalizedText;
  description: LocalizedText;
  /** Accent colour of this illustrated world. */
  accent: string;
  /** Soft background tint used on cards and the collection page. */
  tint: string;
  coverIllustrationSlug: string;
  order: number;
}

export interface CelebrationCategory {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Small decorative emoji/icon rendered inside the stitched dot. */
  icon: string;
  tint: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: LocalizedText;
  priceCents: number;
  /**
   * Printify catalogue references. Filled in once the Printify shop is
   * connected (see docs/PRINTIFY.md); null = fulfilled manually.
   */
  printify: {
    blueprintId: number | null;
    printProviderId: number | null;
    variantId: number | null;
  };
  available: boolean;
}

export interface ProductType {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Whether this support can carry a personalization overlay. */
  personalizable: boolean;
  variants: ProductVariant[];
  order: number;
}

/* ----------------------------- Personalization --------------------------- */

export type PersonalizationFieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "select"
  | "number";

export interface PersonalizationFieldOption {
  value: string;
  label: LocalizedText;
}

export interface PersonalizationField {
  key: string;
  type: PersonalizationFieldType;
  label: LocalizedText;
  placeholder?: LocalizedText;
  required: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: PersonalizationFieldOption[];
  /** Field rendered prominently in the live preview. */
  showInPreview?: boolean;
}

export interface PersonalizationTemplate {
  id: string;
  name: LocalizedText;
  fields: PersonalizationField[];
}

/** Values captured for one cart item. */
export type PersonalizationValues = Record<string, string>;

/* --------------------------------- Money -------------------------------- */

export const CURRENCY = "EUR" as const;

export function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
}

/** Cheapest variant across the product types available for an illustration. */
export function lowestPriceCents(
  illustration: Illustration,
  products: ProductType[],
): number | null {
  const prices = products
    .filter((p) => illustration.productSlugs.includes(p.slug))
    .flatMap((p) => p.variants.filter((v) => v.available))
    .map((v) => v.priceCents);
  return prices.length ? Math.min(...prices) : null;
}
