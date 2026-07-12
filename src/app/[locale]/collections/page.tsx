import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getCollections, getIllustrations } from "@/lib/catalogue";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowRightIcon } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return {
    title: dict.meta.collectionsTitle,
    description: dict.meta.collectionsDescription,
    alternates: {
      canonical: `/${raw}/collections`,
      languages: { fr: "/fr/collections", en: "/en/collections" },
    },
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const collections = await getCollections();

  const counts = await Promise.all(
    collections.map(async (c) => {
      const list = await getIllustrations({ collection: c.slug });
      return list.length;
    }),
  );

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-14 sm:px-10 lg:pl-[230px]">
      <SectionHeading
        title={dict.home.collectionsTitle}
        intro={dict.home.collectionsIntro}
      />

      <div className="mt-14 space-y-10">
        {collections.map((collection, index) => (
          <Link
            key={collection.slug}
            href={`/${locale}/collections/${collection.slug}`}
            className={`illu-card stitched grid items-center gap-8 rounded-[2.5rem] p-8 sm:p-10 md:grid-cols-[auto_1fr_auto] ${
              index % 2 === 1 ? "md:[direction:rtl] md:[&>*]:[direction:ltr]" : ""
            }`}
            style={{ backgroundColor: collection.tint }}
          >
            <span className="relative z-10 mx-auto block h-36 w-36 overflow-hidden rounded-full shadow-plush md:h-44 md:w-44">
              <Image
                src={`/illustrations/${collection.coverIllustrationSlug}/card.webp`}
                alt=""
                width={800}
                height={800}
                sizes="176px"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="relative z-10 text-center md:text-left">
              <span className="font-display block text-3xl font-semibold text-rose">
                {collection.name}
              </span>
              <span className="mt-1 block font-semibold text-rose-ink/80">
                {collection.subtitle[locale]}
              </span>
              <span className="mt-3 block max-w-xl leading-relaxed">
                {collection.description[locale]}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-rose shadow-sm"
            >
              <ArrowRightIcon className="h-5 w-5" />
              <span className="sr-only">{counts[index]}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
