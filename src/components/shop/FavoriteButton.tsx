"use client";

import { useFavorites } from "@/lib/favorites/FavoritesProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { HeartIcon } from "@/components/Icons";

export function FavoriteButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { isFavorite, toggle, ready } = useFavorites();
  const { dict } = useI18n();
  const active = ready && isFavorite(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={active}
      aria-label={active ? dict.illustration.favoriteRemove : dict.illustration.favoriteAdd}
      title={active ? dict.illustration.favoriteRemove : dict.illustration.favoriteAdd}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-ivory/85 shadow-sm backdrop-blur-sm transition-all hover:scale-105 ${
        active ? "text-rose" : "text-rose/60 hover:text-rose"
      } ${className}`}
    >
      <HeartIcon filled={active} className="h-5 w-5" />
    </button>
  );
}
