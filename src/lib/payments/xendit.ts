import "server-only";

import { timingSafeEqual } from "crypto";
import { CURRENCY } from "@/lib/catalogue/types";
import type { Locale } from "@/lib/i18n/config";
import type { CreateCheckoutInput } from "./index";

/* ---------------------------------------------------------------------------
   Xendit integration — hosted Invoices, an alternative to Stripe Checkout
   (handy for Southeast-Asian payment methods). Docs:
   https://developers.xendit.co/api-reference/#create-invoice
--------------------------------------------------------------------------- */

const API_BASE = "https://api.xendit.co";

export function isXenditConfigured(): boolean {
  return Boolean(process.env.XENDIT_SECRET_KEY);
}

function authHeader(): string {
  const key = process.env.XENDIT_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

interface XenditInvoiceItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

interface XenditInvoiceResponse {
  id: string;
  invoice_url: string;
}

/** Xendit expects the amount as a decimal in the currency's major unit
 * (e.g. 12.50 for €12.50) — never the smallest unit like Stripe's cents. */
function centsToMajorUnit(cents: number): number {
  return Math.round(cents) / 100;
}

function xenditLocale(locale: Locale): string {
  return locale === "fr" ? "fr" : "en";
}

export async function createXenditInvoice(
  input: CreateCheckoutInput,
): Promise<{ url: string; id: string }> {
  const body = {
    external_id: input.orderRef,
    payer_email: input.email,
    description: `Mlle l'Abeille — commande ${input.orderRef}`,
    currency: CURRENCY,
    amount: centsToMajorUnit(
      input.lines.reduce(
        (sum, line) => sum + line.unitAmountCents * line.quantity,
        0,
      ),
    ),
    items: input.lines.map<XenditInvoiceItem>((line) => ({
      name: line.name,
      quantity: line.quantity,
      price: centsToMajorUnit(line.unitAmountCents),
      category: "Illustration",
    })),
    locale: xenditLocale(input.locale),
    success_redirect_url: input.successUrl,
    failure_redirect_url: input.cancelUrl,
  };

  const res = await fetch(`${API_BASE}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Xendit create invoice → ${res.status}: ${text}`);
  }

  const json = (await res.json()) as XenditInvoiceResponse;
  return { url: json.invoice_url, id: json.id };
}

/** Xendit signs webhooks with a static verification token (dashboard →
 * Settings → Webhooks), sent back as-is in the `x-callback-token` header —
 * not an HMAC, so a constant-time string compare is what's called for. */
export function verifyXenditCallback(token: string | null): boolean {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
