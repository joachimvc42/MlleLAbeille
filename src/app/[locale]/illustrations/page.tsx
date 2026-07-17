export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import { format, getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  getCelebrations,
  getCollections,
  getIllustrations,
} from "@/lib/catalogue";
import { IllustrationCard } from "@/components/shop/IllustrationCard";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return {
    title: dict.meta.catalogueTitle,
    description: dict.meta.catalogueDescription,
    alternates: {
      canonical: `/${raw}/illustrations`,
      languages: {
        fr: "/fr/illustrations",
        en: "/en/illustrations",
      },
    },
  };
}

export default async function CataloguePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    collection?: string;
    celebration?: string;
    perso?: string;
  }>;
}) {
  const [{ locale: raw }, filters] = await Promise.all([params, searchParams]);
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const [illustrations, collections, celebrations] = await Promise.all([
    getIllustrations({
      collection: filters.collection,
      celebration: filters.celebration,
      personalizable: filters.perso === "1",
    }),
    getCollections(),
    getCelebrations(),
  ]);

  const base = `/${locale}/illustrations`;
  const hasFilter =
    Boolean(filters.collection) ||
    Boolean(filters.celebration) ||
    filters.perso === "1";

  const chip = (active: boolean) =>
    `inline-block rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-rose text-ivory shadow-sm"
        : "border border-rose/25 text-rose-ink hover:border-rose hover:bg-ivory/70"
    }`;

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-14 sm:px-10 lg:pl-[230px]">
      <BreadcrumbJsonLd
        items={[
          { name: dict.common.brand, path: `/${locale}` },
          { name: dict.catalogue.title, path: base },
        ]}
      />

      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold text-rose">
          {dict.catalogue.title}
        </h1>
        <p className="mt-4 leading-relaxed">{dict.catalogue.intro}</p>
      </header>

      {/* Filters as crawlable links */}
      <nav aria-label={dict.catalogue.filterCollection} className="mt-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold uppercase tracking-wide text-rose/70">
            {dict.catalogue.filterCollection}
          </span>
          <Link href={base} className={chip(!hasFilter)}>
            {dict.catalogue.filterAll}
          </Link>
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`${base}?collection=${c.slug}`}
              className={chip(filters.collection === c.slug)}
            >
              {c.name}
            </Link>
          ))}
          <Link
            href={`${base}?perso=1`}
            className={chip(filters.perso === "1")}
          >
            ✎ {dict.catalogue.filterPersonalizable}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold uppercase tracking-wide text-rose/70">
            {dict.catalogue.filterCelebration}
          </span>
          {celebrations.map((c) => (
            <Link
              key={c.slug}
              href={`${base}?celebration=${c.slug}`}
              className={chip(filters.celebration === c.slug)}
            >
              {c.icon} {c.name[locale]}
            </Link>
          ))}
        </div>
      </nav>

      <p className="mt-8 text-sm text-rose-ink/70" role="status">
        {format(dict.catalogue.resultCount, { count: illustrations.length })}
      </p>

      {illustrations.length === 0 ? (
        <p className="mt-10 paper-panel rounded-3xl p-10 text-center">
          {dict.catalogue.empty}
        </p>
      ) : (
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
