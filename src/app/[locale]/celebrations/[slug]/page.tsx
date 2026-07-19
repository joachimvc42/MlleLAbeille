export const revalidate = 300;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  getCelebration,
  getCelebrations,
  getIllustrations,
} from "@/lib/catalogue";
import { IllustrationCard } from "@/components/shop/IllustrationCard";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { CelebrationBee } from "@/components/decor/CelebrationBees";

export async function generateStaticParams() {
  const celebrations = await getCelebrations();
  return celebrations.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const celebration = await getCelebration(slug);
  if (!celebration) return {};
  return {
    title: celebration.name[locale],
    description: celebration.description[locale],
    alternates: {
      canonical: `/${locale}/celebrations/${slug}`,
      languages: {
        fr: `/fr/celebrations/${slug}`,
        en: `/en/celebrations/${slug}`,
      },
    },
  };
}

export default async function CelebrationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const celebration = await getCelebration(slug);
  if (!celebration) notFound();

  const illustrations = await getIllustrations({ celebration: slug });

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: dict.common.brand, path: `/${locale}` },
          { name: dict.nav.celebrations, path: `/${locale}/celebrations` },
          {
            name: celebration.name[locale],
            path: `/${locale}/celebrations/${slug}`,
          },
        ]}
      />

      <header
        className="px-6 py-16 text-center sm:px-10"
        style={{
          background: `linear-gradient(180deg, ${celebration.tint}, transparent)`,
        }}
      >
        <span
          aria-hidden="true"
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ivory/90 shadow-sm"
        >
          <CelebrationBee
            slug={celebration.slug}
            fallback={celebration.icon}
            className="h-14 w-14"
          />
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-rose sm:text-5xl">
          {celebration.name[locale]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed">
          {celebration.description[locale]}
        </p>
      </header>

      <div className="mx-auto max-w-[1300px] px-6 pb-20 sm:px-10 lg:pl-[230px]">
        {illustrations.length === 0 ? (
          <p className="paper-panel rounded-3xl p-10 text-center">
            {dict.catalogue.empty}
          </p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
