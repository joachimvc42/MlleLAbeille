import type { Metadata } from "next";
import Link from "next/link";
import { format, getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { searchCatalogue } from "@/lib/catalogue";
import { IllustrationCard } from "@/components/shop/IllustrationCard";
import { SearchBox } from "@/components/shop/SearchBox";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return {
    title: dict.meta.searchTitle,
    robots: { index: false },
  };
}

const SUGGESTIONS = {
  fr: ["naissance", "anniversaire", "yoga", "jaune", "amitié", "miel"],
  en: ["baby", "birthday", "yoga", "yellow", "friendship", "honey"],
} as const;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ locale: raw }, { q = "" }] = await Promise.all([
    params,
    searchParams,
  ]);
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const results = q ? await searchCatalogue(q, locale) : null;
  const hasResults =
    results !== null &&
    results.illustrations.length +
      results.collections.length +
      results.celebrations.length >
      0;

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-14 sm:px-10 lg:pl-[230px]">
      <header className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold text-rose">
          {dict.search.title}
        </h1>
        <p className="mt-3">{dict.catalogue.searchIntro}</p>
        <div className="mt-6">
          <SearchBox initialQuery={q} />
        </div>
        {!q && (
          <p className="mt-6 text-sm text-rose-ink/70">
            {dict.search.tryThese} :{" "}
            {SUGGESTIONS[locale].map((s, i) => (
              <span key={s}>
                {i > 0 && " · "}
                <Link
                  href={`/${locale}/recherche?q=${encodeURIComponent(s)}`}
                  className="font-semibold text-rose underline-offset-4 hover:underline"
                >
                  {s}
                </Link>
              </span>
            ))}
          </p>
        )}
      </header>

      {results && (
        <div className="mt-14 space-y-14">
          {!hasResults && (
            <p className="rounded-3xl bg-ivory/70 p-10 text-center">
              {format(dict.search.noResults, { query: q })}
            </p>
          )}

          {results.illustrations.length > 0 && (
            <section aria-labelledby="search-illustrations">
              <h2
                id="search-illustrations"
                className="text-2xl font-semibold text-rose"
              >
                {dict.search.illustrations} ({results.illustrations.length})
              </h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {results.illustrations.map((illustration) => (
                  <IllustrationCard
                    key={illustration.slug}
                    illustration={illustration}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}

          {results.collections.length > 0 && (
            <section aria-labelledby="search-collections">
              <h2
                id="search-collections"
                className="text-2xl font-semibold text-rose"
              >
                {dict.search.collections} ({results.collections.length})
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {results.collections.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${locale}/collections/${c.slug}`}
                    className="rounded-full px-5 py-2.5 font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: c.tint, color: "#9d5f59" }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.celebrations.length > 0 && (
            <section aria-labelledby="search-celebrations">
              <h2
                id="search-celebrations"
                className="text-2xl font-semibold text-rose"
              >
                {dict.search.celebrations} ({results.celebrations.length})
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {results.celebrations.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${locale}/celebrations/${c.slug}`}
                    className="rounded-full border border-rose/25 px-5 py-2.5 font-semibold hover:border-rose"
                  >
                    {c.icon} {c.name[locale]}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
