import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { fulfillWithPrintify } from "@/lib/printify/fulfillment";

/**
 * Shared by every payment webhook (Stripe, Xendit, …): mark the order paid
 * and forward it to Printify. Idempotent against duplicate webhook
 * deliveries — the update only matches orders still `pending`, so a second
 * call for the same order is a silent no-op.
 */
export async function markOrderPaidAndFulfill(
  orderRef: string,
  paymentReference: string,
) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    console.warn(`Order ${orderRef} paid but Supabase is not configured`);
    return;
  }

  const { data: order, error } = await admin
    .from("orders")
    .update({ status: "paid", payment_reference: paymentReference })
    .eq("ref", orderRef)
    .eq("status", "pending")
    .select(
      "id, ref, email, shipping_first_name, shipping_last_name, shipping_address1, shipping_address2, shipping_postal_code, shipping_city, shipping_country, shipping_phone",
    )
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
