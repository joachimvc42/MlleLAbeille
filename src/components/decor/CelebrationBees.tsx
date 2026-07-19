import Image from "next/image";

/**
 * One little scene per celebration, composed from the boutique's real
 * watercolour logo bee put in context: baby bottle for naissance, cake
 * with candles for anniversaire, two bees arm in arm for amitié, a
 * « Merci » tag, floating hearts, a lotus, a gift… Falls back to the
 * catalogue emoji for any unknown slug.
 */
const beeSlugs = new Set([
  "naissance",
  "anniversaire",
  "amitie",
  "remerciement",
  "amour",
  "yoga-bien-etre",
  "petites-attentions",
]);

export function CelebrationBee({
  slug,
  fallback,
  className,
}: {
  slug: string;
  fallback?: string;
  className?: string;
}) {
  if (!beeSlugs.has(slug)) {
    return <span aria-hidden="true">{fallback ?? "🐝"}</span>;
  }
  return (
    <Image
      src={`/brand/celebration-bees/${slug}.webp`}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      sizes="64px"
      className={className}
    />
  );
}
