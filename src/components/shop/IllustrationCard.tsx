import Image from "next/image";
import Link from "next/link";
import type { Illustration } from "@/lib/catalogue/types";
import type { Locale } from "@/lib/i18n/config";
import { FavoriteButton } from "./FavoriteButton";

/**
 * Gallery card: the illustration is the hero — no title, no price,
 * no product mockup. Just a soft ceramic tile and a gentle lift on hover.
 */
export function IllustrationCard({
  illustration,
  locale,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  illustration: Illustration;
  locale: Locale;
  priority?: boolean;
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
    </div>
  );
}
