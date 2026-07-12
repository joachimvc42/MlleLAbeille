"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatPrice } from "@/lib/catalogue/types";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/Icons";

export function CartView() {
  const { items, subtotalCents, ready, updateQuantity, removeItem } = useCart();
  const { locale, dict } = useI18n();

  if (!ready) {
    return <p className="mt-10 text-rose-ink/60">{dict.common.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-[2rem] bg-ivory/70 p-12 text-center">
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

  return (
    <div className="mt-10 space-y-8">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.key}
            className="stitched flex flex-wrap items-center gap-5 rounded-[1.8rem] p-5 sm:flex-nowrap"
          >
            <Link
              href={`/${locale}/illustrations/${item.illustrationSlug}`}
              className="relative z-10 block h-24 w-24 shrink-0 overflow-hidden rounded-2xl shadow-sm"
            >
              <Image
                src={item.thumbSrc}
                alt={item.illustrationTitle[locale]}
                width={320}
                height={320}
                sizes="96px"
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="relative z-10 min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-rose">
                {item.illustrationTitle[locale]}
              </p>
              <p className="text-sm text-rose-ink/80">
                {item.productName[locale]} · {item.variantName[locale]}
              </p>
              {item.personalization && (
                <p className="mt-1 truncate text-xs text-rose-ink/60">
                  ✎ {dict.cart.personalization} :{" "}
                  {Object.values(item.personalization)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                aria-label={`${dict.cart.updateQty} −`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rose/25 hover:border-rose"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span
                aria-live="polite"
                className="w-8 text-center font-semibold"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                aria-label={`${dict.cart.updateQty} +`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rose/25 hover:border-rose"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <p className="relative z-10 w-24 text-right font-display text-lg font-semibold text-rose">
              {formatPrice(item.unitPriceCents * item.quantity, locale)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.key)}
              aria-label={`${dict.common.remove} — ${item.illustrationTitle[locale]}`}
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-rose-ink/50 transition-colors hover:bg-rose-whisper hover:text-rose-deep"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="ml-auto max-w-sm space-y-3 rounded-[1.8rem] bg-ivory/80 p-6 shadow-plush">
        <div className="flex justify-between text-sm">
          <span>{dict.cart.subtotal}</span>
          <span className="font-semibold">
            {formatPrice(subtotalCents, locale)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-rose-ink/70">
          <span>{dict.cart.shipping}</span>
          <span>{dict.cart.shippingCalculated}</span>
        </div>
        <div className="flex justify-between border-t border-rose/15 pt-3 font-display text-xl font-semibold text-rose">
          <span>{dict.cart.total}</span>
          <span>{formatPrice(subtotalCents, locale)}</span>
        </div>
        <Link
          href={`/${locale}/commande`}
          className="btn-rose block px-6 py-3.5 text-center font-semibold"
        >
          {dict.cart.checkout}
        </Link>
        <Link
          href={`/${locale}/illustrations`}
          className="block text-center text-sm font-semibold text-rose-ink/70 hover:text-rose"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    </div>
  );
}
