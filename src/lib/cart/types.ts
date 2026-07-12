import type { LocalizedText } from "@/lib/i18n/config";
import type { PersonalizationValues } from "@/lib/catalogue/types";

export interface CartItem {
  /** Stable key: illustration + product + variant + personalization hash. */
  key: string;
  illustrationSlug: string;
  illustrationTitle: LocalizedText;
  thumbSrc: string;
  productSlug: string;
  productName: LocalizedText;
  variantId: string;
  variantName: LocalizedText;
  /** Display hint only — the server re-resolves authoritative prices. */
  unitPriceCents: number;
  quantity: number;
  personalization: PersonalizationValues | null;
}

export function personalizationHash(
  values: PersonalizationValues | null,
): string {
  if (!values) return "none";
  const entries = Object.entries(values)
    .filter(([, v]) => v !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return "none";
  // Compact, stable, unicode-safe fingerprint.
  let hash = 0;
  const raw = JSON.stringify(entries);
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function cartItemKey(
  illustrationSlug: string,
  productSlug: string,
  variantId: string,
  personalization: PersonalizationValues | null,
): string {
  return `${illustrationSlug}--${productSlug}--${variantId}--${personalizationHash(personalization)}`;
}

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
