import "server-only";

/* ---------------------------------------------------------------------------
   Printify integration layer.

   Print-on-demand fulfillment. Once PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID
   are set AND product variants carry their Printify references
   (blueprintId / printProviderId / variantId in the catalogue, or the
   printify_* columns in Supabase), paid orders are forwarded automatically
   from the Stripe webhook.

   Docs: https://developers.printify.com/
   Setup guide: docs/PRINTIFY.md
--------------------------------------------------------------------------- */

const API_BASE = "https://api.printify.com/v1";

export function isPrintifyConfigured(): boolean {
  return Boolean(
    process.env.PRINTIFY_API_TOKEN && process.env.PRINTIFY_SHOP_ID,
  );
}

async function printifyFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) throw new Error("PRINTIFY_API_TOKEN is not set");

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "MlleLAbeille-storefront",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Printify ${init?.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyLineItem {
  /** Printify product id (per-shop product), or use blueprint flow. */
  product_id?: string;
  blueprint_id?: number;
  print_provider_id?: number;
  variant_id: number;
  quantity: number;
  /** Print area files for on-the-fly orders (blueprint flow). */
  print_areas?: { front?: string };
}

export interface PrintifyOrderPayload {
  external_id: string;
  label?: string;
  line_items: PrintifyLineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: PrintifyAddress;
}

/** Submit an order to Printify for production. */
export async function createPrintifyOrder(
  payload: PrintifyOrderPayload,
): Promise<{ id: string }> {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!shopId) throw new Error("PRINTIFY_SHOP_ID is not set");
  return printifyFetch<{ id: string }>(`/shops/${shopId}/orders.json`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** List shops available to the current token (useful to find the shop id). */
export async function listPrintifyShops(): Promise<
  { id: number; title: string }[]
> {
  return printifyFetch<{ id: number; title: string }[]>("/shops.json");
}
