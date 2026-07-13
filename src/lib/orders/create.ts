import "server-only";

import { randomBytes } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getIllustration,
  getPersonalizationTemplate,
  resolveVariantPrice,
} from "@/lib/catalogue";
import { validatePersonalization } from "@/lib/personalization/validate";
import { CURRENCY } from "@/lib/catalogue/types";
import type { CheckoutPayload } from "@/lib/checkout/schema";

export interface PricedLine {
  illustrationSlug: string;
  illustrationTitle: string;
  productSlug: string;
  productName: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  personalization: Record<string, string> | null;
}

export interface PricedOrder {
  ref: string;
  email: string;
  locale: string;
  totalCents: number;
  lines: PricedLine[];
}

export function newOrderRef(): string {
  return `MLB-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Re-price and re-validate every line server-side. Client prices are never
 * trusted; unknown items or invalid personalization abort the checkout.
 */
export async function priceOrder(
  payload: CheckoutPayload,
): Promise<PricedOrder> {
  const lines: PricedLine[] = [];

  for (const item of payload.items) {
    const illustration = await getIllustration(item.illustrationSlug);
    if (!illustration) {
      throw new Error(`Unknown illustration: ${item.illustrationSlug}`);
    }
    if (!illustration.productSlugs.includes(item.productSlug)) {
      throw new Error(
        `Illustration ${item.illustrationSlug} is not available on ${item.productSlug}`,
      );
    }
    const priced = await resolveVariantPrice(item.productSlug, item.variantId);
    if (!priced) {
      throw new Error(
        `Unknown variant ${item.variantId} for product ${item.productSlug}`,
      );
    }

    let personalization: Record<string, string> | null = null;
    if (item.personalization) {
      const template = await getPersonalizationTemplate(
        illustration.personalizationTemplateId,
      );
      if (template) {
        const result = validatePersonalization(template, item.personalization);
        if (!result.ok) {
          throw new Error(
            `Invalid personalization for ${item.illustrationSlug}`,
          );
        }
        personalization = Object.keys(result.clean).length
          ? result.clean
          : null;
      }
    }

    lines.push({
      illustrationSlug: illustration.slug,
      illustrationTitle: illustration.title[payload.locale],
      productSlug: item.productSlug,
      productName: priced.productName[payload.locale],
      variantId: item.variantId,
      quantity: item.quantity,
      unitPriceCents: priced.priceCents,
      personalization,
    });
  }

  const totalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  return {
    ref: newOrderRef(),
    email: payload.email,
    locale: payload.locale,
    totalCents,
    lines,
  };
}

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "cancelled";

/**
 * Persist the order in Supabase when configured. Uses the service-role
 * client because guests may order without an account; RLS keeps the tables
 * closed to the public. Silently no-ops (returning false) without Supabase
 * so demo mode keeps working.
 */
export async function persistOrder(
  order: PricedOrder,
  payload: CheckoutPayload,
  status: OrderStatus,
  paymentProvider: "stripe" | "mock",
  userId: string | null,
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  if (!admin) return false;

  const { data: inserted, error } = await admin
    .from("orders")
    .insert({
      ref: order.ref,
      user_id: userId,
      email: order.email,
      locale: order.locale,
      status,
      currency: CURRENCY,
      subtotal_cents: order.totalCents,
      shipping_cents: 0,
      total_cents: order.totalCents,
      payment_provider: paymentProvider,
      shipping_first_name: payload.address.firstName,
      shipping_last_name: payload.address.lastName,
      shipping_address1: payload.address.address1,
      shipping_address2: payload.address.address2 || null,
      shipping_postal_code: payload.address.postalCode,
      shipping_city: payload.address.city,
      shipping_country: payload.address.country,
      shipping_phone: payload.address.phone || null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("persistOrder failed", error);
    return false;
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    order.lines.map((line) => ({
      order_id: inserted.id,
      illustration_slug: line.illustrationSlug,
      illustration_title: line.illustrationTitle,
      product_slug: line.productSlug,
      product_name: line.productName,
      variant_id: line.variantId,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
      personalization: line.personalization,
    })),
  );
  if (itemsError) {
    console.error("persistOrder items failed", itemsError);
  }
  return true;
}
