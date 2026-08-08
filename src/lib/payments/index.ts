import "server-only";

import Stripe from "stripe";
import { CURRENCY } from "@/lib/catalogue/types";
import type { Locale } from "@/lib/i18n/config";
import { createXenditInvoice, isXenditConfigured } from "./xendit";

/* ---------------------------------------------------------------------------
   Payment abstraction.

   - With STRIPE_SECRET_KEY set              → real Stripe Checkout session.
   - Else with XENDIT_SECRET_KEY set         → real Xendit hosted Invoice.
   - Otherwise                               → "mock" provider: the order is
     recorded as a demo order and the customer lands directly on the
     confirmation page. No fake production payment is ever simulated
     silently: the UI clearly labels demo mode (dict.checkout.devPayment).

   Stripe takes priority when both are configured, so existing deployments
   keep behaving exactly as before; unset STRIPE_SECRET_KEY to switch to
   Xendit instead.
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

export type PaymentProvider = "stripe" | "xendit" | "mock";

export type CheckoutResult =
  | { type: "redirect"; url: string; provider: "stripe" | "xendit" }
  | { type: "confirmed"; provider: "mock" };

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** Which provider `createCheckout` will actually use, so the UI can label
 * itself correctly before the customer submits the form. */
export function activePaymentProvider(): PaymentProvider {
  if (isStripeConfigured()) return "stripe";
  if (isXenditConfigured()) return "xendit";
  return "mock";
}

export async function createCheckout(
  input: CreateCheckoutInput,
): Promise<CheckoutResult> {
  const stripe = getStripe();

  if (!stripe) {
    if (isXenditConfigured()) {
      const invoice = await createXenditInvoice(input);
      return { type: "redirect", url: invoice.url, provider: "xendit" };
    }
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
