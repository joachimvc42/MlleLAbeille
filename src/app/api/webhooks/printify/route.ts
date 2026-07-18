import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Printify webhook — configure in the Printify dashboard (or via
 * POST /v1/shops/{shop_id}/webhooks.json):
 *   endpoint: {SITE_URL}/api/webhooks/printify
 *   events:   order:shipment:created, order:shipment:delivered
 *
 * When the webhook is created with a secret, Printify signs each call:
 *   X-Pfy-Signature: sha256=<HMAC-SHA256 hex of the raw body>
 * Set PRINTIFY_WEBHOOK_SECRET to the same value and it is enforced here.
 */

function hasValidSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const secret = process.env.PRINTIFY_WEBHOOK_SECRET;
  if (secret) {
    const signature = request.headers.get("x-pfy-signature");
    if (!hasValidSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  let event: {
    type?: string;
    resource?: { id?: string | number; data?: { external_id?: string } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Our order ref travels as external_id; the Printify order id is stored
  // on the order as fulfillment_reference. Accept either, since not every
  // event payload carries external_id.
  const externalId = event.resource?.data?.external_id ?? null;
  const printifyOrderId =
    event.resource?.id != null ? String(event.resource.id) : null;
  if (!externalId && !printifyOrderId) {
    return NextResponse.json({ received: true });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ received: true });

  const match = externalId
    ? { column: "ref", value: externalId }
    : { column: "fulfillment_reference", value: printifyOrderId! };

  if (event.type === "order:shipment:created") {
    await admin
      .from("orders")
      .update({ status: "shipped" })
      .eq(match.column, match.value)
      .in("status", ["paid", "processing"]);
  } else if (event.type === "order:shipment:delivered") {
    await admin
      .from("orders")
      .update({ status: "delivered" })
      .eq(match.column, match.value)
      .eq("status", "shipped");
  }

  return NextResponse.json({ received: true });
}
