"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/lib/i18n/config";
import { CartProvider } from "@/lib/cart/CartProvider";
import { FavoritesProvider } from "@/lib/favorites/FavoritesProvider";

export function Providers({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nProvider locale={locale} dict={dict}>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </I18nProvider>
  );
}
