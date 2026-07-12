import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getIllustrations } from "@/lib/catalogue";
import { FavoritesGrid } from "@/components/shop/FavoritesGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return { title: dict.meta.favoritesTitle, robots: { index: false } };
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const illustrations = await getIllustrations();

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-14 sm:px-10 lg:pl-[230px]">
      <h1 className="text-4xl font-semibold text-rose">
        {dict.favorites.title}
      </h1>
      <FavoritesGrid illustrations={illustrations} />
    </div>
  );
}
