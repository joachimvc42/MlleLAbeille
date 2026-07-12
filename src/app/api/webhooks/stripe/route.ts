import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/payments";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { fulfillWithPrintify } from "@/lib/printify/fulfillment";

/**
 * Stripe webhook — configure in the Stripe dashboard:
 *   endpoint: {SITE_URL}/api/webhooks/stripe
 *   events:   checkout.session.completed
 * and set STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderRef = session.metadata?.order_ref;
    if (orderRef) {
      await markOrderPaidAndFulfill(orderRef, session.id);
    }
  }

  return NextResponse.json({ received: true });
}

async function markOrderPaidAndFulfill(orderRef: string, sessionId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    console.warn(`Order ${orderRef} paid but Supabase is not configured`);
    return;
  }

  const { data: order, error } = await admin
    .from("orders")
    .update({ status: "paid", payment_reference: sessionId })
    .eq("ref", orderRef)
    .eq("status", "pending")
    .select("id, ref, email, shipping_first_name, shipping_last_name, shipping_address1, shipping_address2, shipping_postal_code, shipping_city, shipping_country, shipping_phone")
    .single();

  if (error || !order) {
    console.error(`Could not mark order ${orderRef} as paid`, error);
    return;
  }

  const { data: items } = await admin
    .from("order_items")
    .select("product_slug, variant_id, quantity")
    .eq("order_id", order.id);

  if (!items?.length) return;

  try {
    const result = await fulfillWithPrintify({
      orderRef: order.ref,
      address: {
        first_name: order.shipping_first_name,
        last_name: order.shipping_last_name,
        email: order.email,
        phone: order.shipping_phone ?? undefined,
        country: order.shipping_country,
        address1: order.shipping_address1,
        address2: order.shipping_address2 ?? undefined,
        city: order.shipping_city,
        zip: order.shipping_postal_code,
      },
      items: items.map((item) => ({
        productSlug: item.product_slug,
        variantId: item.variant_id,
        quantity: item.quantity,
      })),
    });

    if (result.status === "submitted") {
      await admin
        .from("orders")
        .update({
          status: "processing",
          fulfillment_provider: "printify",
          fulfillment_reference: result.printifyOrderId,
        })
        .eq("id", order.id);
    }
  } catch (fulfillError) {
    // Payment stays recorded; fulfillment can be retried manually.
    console.error(`Printify fulfillment failed for ${orderRef}`, fulfillError);
  }
}
