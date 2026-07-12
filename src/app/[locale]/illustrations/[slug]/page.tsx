import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  getCelebrations,
  getCollections,
  getIllustration,
  getIllustrations,
  getPersonalizationTemplate,
  getProductsForIllustration,
  getRelatedIllustrations,
} from "@/lib/catalogue";
import { ProductConfigurator } from "@/components/shop/ProductConfigurator";
import { IllustrationCard } from "@/components/shop/IllustrationCard";
import { FavoriteButton } from "@/components/shop/FavoriteButton";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  const illustrations = await getIllustrations();
  return illustrations.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const illustration = await getIllustration(slug);
  if (!illustration) return {};

  return {
    title: illustration.title[locale],
    description: illustration.description[locale],
    alternates: {
      canonical: `/${locale}/illustrations/${slug}`,
      languages: {
        fr: `/fr/illustrations/${slug}`,
        en: `/en/illustrations/${slug}`,
      },
    },
    openGraph: {
      title: illustration.title[locale],
      description: illustration.description[locale],
      images: [
        {
          url: illustration.image.src.replace("/full.webp", "/card.webp"),
          width: 800,
          height: 800,
          alt: illustration.image.alt[locale],
        },
      ],
    },
  };
}

export default async function IllustrationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const illustration = await getIllustration(slug);
  if (!illustration) notFound();

  const [products, related, allCollections, allCelebrations] =
    await Promise.all([
      getProductsForIllustration(illustration),
      getRelatedIllustrations(illustration),
      getCollections(),
      getCelebrations(),
    ]);
  const template = getPersonalizationTemplate(
    illustration.personalizationTemplateId,
  );

  const collections = allCollections.filter((c) =>
    illustration.collections.includes(c.slug),
  );
  const celebrations = allCelebrations.filter((c) =>
    illustration.celebrations.includes(c.slug),
  );

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-14 sm:px-10 lg:pl-[230px]">
      <ProductJsonLd
        illustration={illustration}
        products={products}
        locale={locale}
      />
      <BreadcrumbJsonLd
        items={[
          { name: dict.common.brand, path: `/${locale}` },
          { name: dict.catalogue.title, path: `/${locale}/illustrations` },
          {
            name: illustration.title[locale],
            path: `/${locale}/illustrations/${illustration.slug}`,
          },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ------------------------------ Artwork ----------------------------- */}
        <div>
          <div
            className="illu-card relative overflow-hidden"
            style={{ backgroundColor: illustration.image.background }}
          >
            <Image
              src={illustration.image.src}
              alt={illustration.image.alt[locale]}
              width={illustration.image.width}
              height={illustration.image.height}
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="w-full"
            />
            <FavoriteButton
              slug={illustration.slug}
              className="absolute right-5 top-5"
            />
          </div>

          {(collections.length > 0 || celebrations.length > 0) && (
            <div className="mt-6 space-y-3 text-sm">
              {collections.length > 0 && (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold uppercase tracking-wide text-rose/70">
                    {dict.illustration.collection}
                  </span>
                  {collections.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${locale}/collections/${c.slug}`}
                      className="rounded-full px-3.5 py-1.5 font-semibold transition-transform hover:-translate-y-0.5"
                      style={{ backgroundColor: c.tint, color: "#9d5f59" }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </p>
              )}
              {celebrations.length > 0 && (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold uppercase tracking-wide text-rose/70">
                    {dict.illustration.celebrations}
                  </span>
                  {celebrations.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${locale}/celebrations/${c.slug}`}
                      className="rounded-full border border-rose/20 px-3.5 py-1.5 font-semibold hover:border-rose"
                    >
                      {c.icon} {c.name[locale]}
                    </Link>
                  ))}
                </p>
              )}
            </div>
          )}
        </div>

        {/* --------------------------- Configurator --------------------------- */}
        <div>
          <h1 className="text-4xl font-semibold text-rose">
            {illustration.title[locale]}
          </h1>
          <p className="mt-4 text-lg leading-relaxed">
            {illustration.description[locale]}
          </p>
          <div className="mt-8">
            <ProductConfigurator
              illustration={illustration}
              products={products}
              template={template}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------ Related ------------------------------ */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24">
          <h2
            id="related-title"
            className="text-center text-3xl font-semibold text-rose"
          >
            {dict.illustration.related}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <IllustrationCard
                key={r.slug}
                illustration={r}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
