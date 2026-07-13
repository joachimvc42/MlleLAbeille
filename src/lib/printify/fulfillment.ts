import "server-only";

import { resolvePrintifyRefs } from "@/lib/catalogue";
import {
  createPrintifyOrder,
  isPrintifyConfigured,
  type PrintifyAddress,
  type PrintifyLineItem,
} from "./client";

export interface FulfillmentItem {
  productSlug: string;
  variantId: string;
  quantity: number;
}

export interface FulfillmentRequest {
  orderRef: string;
  address: PrintifyAddress;
  items: FulfillmentItem[];
}

export type FulfillmentResult =
  | { status: "submitted"; printifyOrderId: string }
  | { status: "skipped"; reason: string };

/**
 * Forward a paid order to Printify. Items whose variants have no Printify
 * references yet are left for manual fulfillment — the order is never
 * blocked, and the outcome is reported so it can be stored on the order.
 */
export async function fulfillWithPrintify(
  request: FulfillmentRequest,
): Promise<FulfillmentResult> {
  if (!isPrintifyConfigured()) {
    return { status: "skipped", reason: "printify_not_configured" };
  }

  const lineItems: PrintifyLineItem[] = [];
  for (const item of request.items) {
    const refs = await resolvePrintifyRefs(item.productSlug, item.variantId);
    if (
      !refs ||
      refs.variantId === null ||
      refs.blueprintId === null ||
      refs.printProviderId === null
    ) {
      continue; // manual fulfillment for this line
    }
    lineItems.push({
      blueprint_id: refs.blueprintId,
      print_provider_id: refs.printProviderId,
      variant_id: refs.variantId,
      quantity: item.quantity,
    });
  }

  if (lineItems.length === 0) {
    return { status: "skipped", reason: "no_printify_variants_mapped" };
  }

  const order = await createPrintifyOrder({
    external_id: request.orderRef,
    label: `MlleLAbeille ${request.orderRef}`,
    line_items: lineItems,
    shipping_method: 1, // standard
    send_shipping_notification: true,
    address_to: request.address,
  });

  return { status: "submitted", printifyOrderId: order.id };
}
