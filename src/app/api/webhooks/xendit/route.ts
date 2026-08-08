import { NextResponse } from "next/server";
import { verifyXenditCallback } from "@/lib/payments/xendit";
import { markOrderPaidAndFulfill } from "@/lib/orders/fulfill";

/**
 * Xendit webhook — configure in the Xendit dashboard:
 *   Settings → Webhooks → Invoices callback
 *   URL: {SITE_URL}/api/webhooks/xendit
 * Copy the Verification Token shown there into XENDIT_WEBHOOK_TOKEN.
 */
export async function POST(request: Request) {
  const token = request.headers.get("x-callback-token");
  if (!verifyXenditCallback(token)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  let body: { external_id?: string; id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (
    (body.status === "PAID" || body.status === "SETTLED") &&
    body.external_id
  ) {
    await markOrderPaidAndFulfill(body.external_id, body.id ?? body.external_id);
  }

  return NextResponse.json({ received: true });
}
