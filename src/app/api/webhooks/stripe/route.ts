import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/payments";
import { markOrderPaidAndFulfill } from "@/lib/orders/fulfill";

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
