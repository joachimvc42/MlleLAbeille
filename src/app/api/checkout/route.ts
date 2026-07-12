import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout/schema";
import { persistOrder, priceOrder } from "@/lib/orders/create";
import { createCheckout, isStripeConfigured } from "@/lib/payments";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mllelabeille.vercel.app";

export async function POST(request: Request) {
  let payload;
  try {
    payload = checkoutSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  let order;
  try {
    order = await priceOrder(payload);
  } catch (error) {
    console.error("checkout pricing failed", error);
    return NextResponse.json({ error: "invalid_items" }, { status: 400 });
  }

  // Attach the order to the signed-in customer when there is one.
  let userId: string | null = null;
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }

  const confirmationUrl = `${siteUrl}/${payload.locale}/commande/confirmation?ref=${order.ref}`;

  try {
    const result = await createCheckout({
      orderRef: order.ref,
      email: order.email,
      locale: payload.locale,
      lines: order.lines.map((line) => ({
        name: `${line.illustrationTitle} — ${line.productName}`,
        unitAmountCents: line.unitPriceCents,
        quantity: line.quantity,
      })),
      successUrl: confirmationUrl,
      cancelUrl: `${siteUrl}/${payload.locale}/commande`,
    });

    if (result.type === "redirect") {
      // Real payment: order stays pending until the Stripe webhook confirms.
      await persistOrder(order, payload, "pending", "stripe", userId);
      return NextResponse.json({ url: result.url, ref: order.ref });
    }

    // Demo mode: record as pending demo order, go straight to confirmation.
    await persistOrder(order, payload, "pending", "mock", userId);
    return NextResponse.json({
      url: confirmationUrl,
      ref: order.ref,
      demo: !isStripeConfigured(),
    });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
