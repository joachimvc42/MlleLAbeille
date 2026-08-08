export const revalidate = 300;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  getCollection,
  getCollections,
  getIllustrations,
} from "@/lib/catalogue";
import { IllustrationCard } from "@/components/shop/IllustrationCard";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const collection = await getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description[locale],
    alternates: {
      canonical: `/${locale}/collections/${slug}`,
      languages: {
        fr: `/fr/collections/${slug}`,
        en: `/en/collections/${slug}`,
      },
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const collection = await getCollection(slug);
  if (!collection) notFound();

  const illustrations = await getIllustrations({ collection: slug });

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: dict.common.brand, path: `/${locale}` },
          { name: dict.nav.collections, path: `/${locale}/collections` },
          { name: collection.name, path: `/${locale}/collections/${slug}` },
        ]}
      />

      {/* Collection sky */}
      <header
        className="px-6 py-16 text-center sm:px-10"
        style={{
          background: `linear-gradient(180deg, ${collection.tint}, transparent)`,
        }}
      >
        <p
          className="mx-auto inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-ivory"
          style={{ backgroundColor: collection.accent }}
        >
          {dict.nav.collections}
        </p>
        <h1
          className="mt-4 text-4xl font-semibold sm:text-5xl"
          style={{
            color:
              collection.slug === "la-vie-en-vert"
                ? "#739149"
                : collection.accent,
          }}
        >
          {collection.name}
        </h1>
        <p className="mt-2 font-semibold text-rose-ink/80">
          {collection.subtitle[locale]}
        </p>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed">
          {collection.description[locale]}
        </p>
      </header>

      <div className="mx-auto max-w-[1300px] px-6 pb-20 sm:px-10 lg:pl-[230px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {illustrations.map((illustration, index) => (
            <IllustrationCard
              key={illustration.slug}
              illustration={illustration}
              locale={locale}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
