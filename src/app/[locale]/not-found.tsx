import Image from "next/image";
import Link from "next/link";

/**
 * Locale is not available in not-found boundaries, so this page is
 * gently bilingual.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
      <div className="mx-auto h-36 w-36 overflow-hidden rounded-full opacity-90 shadow-plush">
        <Image
          src="/illustrations/abeille-sereine/card.webp"
          alt=""
          width={800}
          height={800}
          sizes="144px"
          className="h-full w-full object-cover"
        />
      </div>
      <h1 className="mt-8 text-3xl font-semibold text-rose">
        Oh… cette page s’est envolée.
      </h1>
      <p className="mt-3 text-rose-ink/80">
        This page seems to have flown away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/fr" className="btn-rose px-6 py-3 font-semibold">
          Retour à l’accueil
        </Link>
        <Link href="/en" className="btn-ghost px-6 py-3 font-semibold">
          Back home
        </Link>
      </div>
    </div>
  );
}
