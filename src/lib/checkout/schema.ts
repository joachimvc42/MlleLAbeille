import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const checkoutItemSchema = z.object({
  illustrationSlug: z.string().min(1).max(80),
  productSlug: z.string().min(1).max(40),
  variantId: z.string().min(1).max(60),
  quantity: z.number().int().min(1).max(99),
  personalization: z.record(z.string(), z.string().max(200)).nullable(),
});

export const checkoutAddressSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  address1: z.string().trim().min(3).max(120),
  address2: z.string().trim().max(120).optional().default(""),
  postalCode: z.string().trim().min(2).max(16),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().length(2),
  phone: z.string().trim().max(24).optional().default(""),
});

export const checkoutSchema = z.object({
  email: z.string().trim().email().max(160),
  locale: z.enum(locales),
  address: checkoutAddressSchema,
  items: z.array(checkoutItemSchema).min(1).max(40),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
