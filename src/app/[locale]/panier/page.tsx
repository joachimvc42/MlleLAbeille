import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { CartView } from "@/components/shop/CartView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return { title: dict.meta.cartTitle, robots: { index: false } };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14 sm:px-10">
      <h1 className="text-4xl font-semibold text-rose">{dict.cart.title}</h1>
      <CartView />
    </div>
  );
}
