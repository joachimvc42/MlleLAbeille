"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatPrice } from "@/lib/catalogue/types";

const COUNTRIES = {
  fr: [
    ["FR", "France"],
    ["CH", "Suisse"],
    ["BE", "Belgique"],
    ["LU", "Luxembourg"],
    ["DE", "Allemagne"],
    ["IT", "Italie"],
    ["ES", "Espagne"],
    ["GB", "Royaume-Uni"],
    ["ID", "Indonésie"],
    ["CA", "Canada"],
    ["US", "États-Unis"],
  ],
  en: [
    ["FR", "France"],
    ["CH", "Switzerland"],
    ["BE", "Belgium"],
    ["LU", "Luxembourg"],
    ["DE", "Germany"],
    ["IT", "Italy"],
    ["ES", "Spain"],
    ["GB", "United Kingdom"],
    ["ID", "Indonesia"],
    ["CA", "Canada"],
    ["US", "United States"],
  ],
} as const;

export function CheckoutForm({
  stripeConfigured,
}: {
  stripeConfigured: boolean;
}) {
  const { items, subtotalCents, ready, clear } = useCart();
  const { locale, dict } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  if (!ready) {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] bg-ivory/70 p-12 text-center">
        <p className="text-lg">{dict.cart.empty}</p>
        <Link
          href={`/${locale}/illustrations`}
          className="btn-rose mt-6 inline-block px-7 py-3.5 font-semibold"
        >
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");

    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          locale,
          address: {
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            address1: form.get("address1"),
            address2: form.get("address2") || "",
            postalCode: form.get("postalCode"),
            city: form.get("city"),
            country: form.get("country"),
            phone: form.get("phone") || "",
          },
          items: items.map((item) => ({
            illustrationSlug: item.illustrationSlug,
            productSlug: item.productSlug,
            variantId: item.variantId,
            quantity: item.quantity,
            personalization: item.personalization,
          })),
        }),
      });
      const data: { url?: string } = await res.json();
      if (!res.ok || !data.url) throw new Error();
      clear();
      window.location.assign(data.url);
    } catch {
      setState("error");
    }
  }

  const input =
    "w-full rounded-2xl border border-rose/20 bg-ivory px-4 py-3 text-sm placeholder:text-rose-ink/40 focus:border-rose";
  const label = "mb-1 block text-sm font-semibold";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="space-y-8">
        <fieldset className="stitched rounded-[1.8rem] p-6">
          <legend className="font-display px-2 text-lg font-semibold text-rose">
            {dict.checkout.contact}
          </legend>
          <div className="relative z-10">
            <label htmlFor="co-email" className={label}>
              {dict.checkout.email}
            </label>
            <input
              id="co-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={input}
            />
          </div>
        </fieldset>

        <fieldset className="stitched rounded-[1.8rem] p-6">
          <legend className="font-display px-2 text-lg font-semibold text-rose">
            {dict.checkout.shippingAddress}
          </legend>
          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="co-first" className={label}>
                {dict.checkout.firstName}
              </label>
              <input id="co-first" name="firstName" required autoComplete="given-name" className={input} />
            </div>
            <div>
              <label htmlFor="co-last" className={label}>
                {dict.checkout.lastName}
              </label>
              <input id="co-last" name="lastName" required autoComplete="family-name" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-a1" className={label}>
                {dict.checkout.address1}
              </label>
              <input id="co-a1" name="address1" required autoComplete="address-line1" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-a2" className={label}>
                {dict.checkout.address2}
              </label>
              <input id="co-a2" name="address2" autoComplete="address-line2" className={input} />
            </div>
            <div>
              <label htmlFor="co-zip" className={label}>
                {dict.checkout.postalCode}
              </label>
              <input id="co-zip" name="postalCode" required autoComplete="postal-code" className={input} />
            </div>
            <div>
              <label htmlFor="co-city" className={label}>
                {dict.checkout.city}
              </label>
              <input id="co-city" name="city" required autoComplete="address-level2" className={input} />
            </div>
            <div>
              <label htmlFor="co-country" className={label}>
                {dict.checkout.country}
              </label>
              <select id="co-country" name="country" required defaultValue="FR" className={input}>
                {COUNTRIES[locale].map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="co-phone" className={label}>
                {dict.checkout.phone}
              </label>
              <input id="co-phone" name="phone" type="tel" autoComplete="tel" className={input} />
            </div>
          </div>
        </fieldset>

        <fieldset className="stitched rounded-[1.8rem] p-6">
          <legend className="font-display px-2 text-lg font-semibold text-rose">
            {dict.checkout.payment}
          </legend>
          <div className="relative z-10">
            {stripeConfigured ? (
              <p className="text-sm">🔒 {dict.checkout.paymentSecure} — Stripe</p>
            ) : (
              <p className="rounded-2xl bg-honey-whisper px-4 py-3 text-sm">
                {dict.checkout.devPayment}
              </p>
            )}
            {state === "error" && (
              <p role="alert" className="mt-3 text-sm font-semibold text-rose-deep">
                {dict.common.error}
              </p>
            )}
            <button
              type="submit"
              disabled={state === "sending"}
              className="btn-rose mt-5 w-full px-8 py-4 font-semibold disabled:opacity-60 sm:w-auto"
            >
              {state === "sending"
                ? dict.checkout.processing
                : stripeConfigured
                  ? dict.checkout.payWithStripe
                  : dict.checkout.devPay}
            </button>
          </div>
        </fieldset>
      </form>

      {/* Order summary */}
      <aside className="h-fit rounded-[1.8rem] bg-ivory/80 p-6 shadow-plush">
        <h2 className="font-display text-lg font-semibold text-rose">
          {dict.cart.title}
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {item.quantity} × {item.illustrationTitle[locale]}
                </span>
                <span className="text-rose-ink/70">
                  {item.productName[locale]} · {item.variantName[locale]}
                </span>
              </span>
              <span className="shrink-0 font-semibold">
                {formatPrice(item.unitPriceCents * item.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-rose/15 pt-4 font-display text-xl font-semibold text-rose">
          <span>{dict.cart.total}</span>
          <span>{formatPrice(subtotalCents, locale)}</span>
        </div>
        <p className="mt-2 text-xs text-rose-ink/60">
          {dict.cart.shipping} : {dict.cart.shippingCalculated}
        </p>
      </aside>
    </div>
  );
}
