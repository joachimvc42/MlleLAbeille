"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites/FavoritesProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Illustration } from "@/lib/catalogue/types";
import { IllustrationCard } from "./IllustrationCard";

export function FavoritesGrid({
  illustrations,
}: {
  illustrations: Illustration[];
}) {
  const { slugs, ready } = useFavorites();
  const { locale, dict } = useI18n();

  if (!ready) {
    return <p className="mt-10 text-rose-ink/60">{dict.common.loading}</p>;
  }

  const favorites = illustrations.filter((i) => slugs.includes(i.slug));

  if (favorites.length === 0) {
    return (
      <div className="mt-10 rounded-[2rem] bg-ivory/70 p-12 text-center">
        <p className="text-lg">{dict.favorites.empty}</p>
        <Link
          href={`/${locale}/illustrations`}
          className="btn-rose mt-6 inline-block px-7 py-3.5 font-semibold"
        >
          {dict.favorites.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((illustration) => (
        <IllustrationCard
          key={illustration.slug}
          illustration={illustration}
          locale={locale}
        />
      ))}
    </div>
  );
}
