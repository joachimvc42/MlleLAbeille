import Image from "next/image";
import Link from "next/link";
import type { Illustration } from "@/lib/catalogue/types";
import type { Locale } from "@/lib/i18n/config";
import { FavoriteButton } from "./FavoriteButton";

/**
 * Gallery card: the illustration is the hero — no price, no product
 * mockup. A soft ceramic tile with a gentle lift, and (per the reference
 * artwork) an optional small hand-written caption beneath the tile.
 */
export function IllustrationCard({
  illustration,
  locale,
  priority = false,
  caption = true,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  illustration: Illustration;
  locale: Locale;
  priority?: boolean;
  caption?: boolean;
  sizes?: string;
}) {
  const cardSrc = illustration.image.src.replace("/full.webp", "/card.webp");

  return (
    <div className="group relative">
      <Link
        href={`/${locale}/illustrations/${illustration.slug}`}
        aria-label={illustration.title[locale]}
        className="illu-card block overflow-hidden"
        style={{ backgroundColor: illustration.image.background }}
      >
        <Image
          src={cardSrc}
          alt={illustration.image.alt[locale]}
          width={800}
          height={800}
          priority={priority}
          sizes={sizes}
          className="illu-card-img aspect-square w-full object-cover"
        />
      </Link>
      <FavoriteButton
        slug={illustration.slug}
        className="absolute right-4 top-4 opacity-90"
      />
      {caption && (
        <p
          aria-hidden="true"
          className="font-display mt-3 text-center text-[0.95rem] italic text-rose-ink/80"
        >
          {illustration.title[locale]}
        </p>
      )}
    </div>
  );
}
