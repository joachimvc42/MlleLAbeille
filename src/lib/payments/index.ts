import "server-only";

import Stripe from "stripe";
import { CURRENCY } from "@/lib/catalogue/types";
import type { Locale } from "@/lib/i18n/config";

/* ---------------------------------------------------------------------------
   Payment abstraction.

   - With STRIPE_SECRET_KEY set  → real Stripe Checkout session.
   - Without                     → "mock" provider: the order is recorded as
     a demo order and the customer lands directly on the confirmation page.
     No fake production payment is ever simulated silently: the UI clearly
     labels demo mode (dict.checkout.devPayment).
--------------------------------------------------------------------------- */

export interface CheckoutLine {
  name: string;
  description?: string;
  imageUrl?: string;
  unitAmountCents: number;
  quantity: number;
}

export interface CreateCheckoutInput {
  orderRef: string;
  email: string;
  locale: Locale;
  lines: CheckoutLine[];
  successUrl: string;
  cancelUrl: string;
}

export type CheckoutResult =
  | { type: "redirect"; url: string; provider: "stripe" }
  | { type: "confirmed"; provider: "mock" };

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function createCheckout(
  input: CreateCheckoutInput,
): Promise<CheckoutResult> {
  const stripe = getStripe();

  if (!stripe) {
    // Demo mode — the caller records the order as a test order.
    return { type: "confirmed", provider: "mock" };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    locale: input.locale,
    line_items: input.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: CURRENCY.toLowerCase(),
        unit_amount: line.unitAmountCents,
        product_data: {
          name: line.name,
          ...(line.description && { description: line.description }),
          ...(line.imageUrl && { images: [line.imageUrl] }),
        },
      },
    })),
    metadata: { order_ref: input.orderRef },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  if (!session.url) {
    throw new Error("Stripe session created without a redirect URL");
  }
  return { type: "redirect", url: session.url, provider: "stripe" };
}
