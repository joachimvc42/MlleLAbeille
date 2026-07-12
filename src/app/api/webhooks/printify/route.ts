import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Printify webhook — configure in the Printify dashboard:
 *   endpoint: {SITE_URL}/api/webhooks/printify
 *   events:   order:shipment:created, order:shipment:delivered
 *
 * Printify signs calls with an optional shared secret; set
 * PRINTIFY_WEBHOOK_SECRET and it will be enforced here.
 */
export async function POST(request: Request) {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET;
  if (secret) {
    const provided = request.headers.get("x-printify-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let event: {
    type?: string;
    resource?: { data?: { external_id?: string } };
  };
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const externalId = event.resource?.data?.external_id;
  if (!externalId) return NextResponse.json({ received: true });

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ received: true });

  if (event.type === "order:shipment:created") {
    await admin
      .from("orders")
      .update({ status: "shipped" })
      .eq("ref", externalId)
      .in("status", ["paid", "processing"]);
  } else if (event.type === "order:shipment:delivered") {
    await admin
      .from("orders")
      .update({ status: "delivered" })
      .eq("ref", externalId)
      .eq("status", "shipped");
  }

  return NextResponse.json({ received: true });
}
