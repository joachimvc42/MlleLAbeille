import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  getCelebrations,
  getCollections,
  getFeaturedIllustrations,
} from "@/lib/catalogue";
import { IllustrationCard } from "@/components/shop/IllustrationCard";
import { SectionHeading } from "@/components/SectionHeading";
import { HeroScene } from "@/components/home/HeroScene";
import { ArrowRightIcon } from "@/components/Icons";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/lib/seo/jsonld";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const [featured, collections, celebrations] = await Promise.all([
    getFeaturedIllustrations(),
    getCollections(),
    getCelebrations(),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd locale={locale} />

      {/* ------------------------------- Hero ------------------------------ */}
      <section
        aria-labelledby="hero-title"
        className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-[1300px] items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.02fr_0.98fr] lg:pl-[230px]"
      >
        <div className="max-w-xl">
          <h1
            id="hero-title"
            className="text-4xl font-semibold leading-[1.15] text-rose sm:text-5xl"
          >
            {dict.home.heroTitle}
          </h1>
          <p className="mt-6 text-lg leading-relaxed sm:text-xl">
            {dict.home.heroText}
          </p>
          <div
            aria-hidden="true"
            className="mt-7 h-2 w-40 rounded-full bg-honey/60"
          />
          <Link
            href={`/${locale}/illustrations`}
            className="btn-rose mt-9 inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold"
          >
            {dict.home.heroCta}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <HeroScene beeAlt={dict.home.heroAlt} />
      </section>

      {/* --------------------------- Featured six -------------------------- */}
      <section
        aria-labelledby="featured-title"
        className="mx-auto max-w-[1300px] px-6 py-20 sm:px-10 lg:pl-[230px]"
      >
        <SectionHeading
          id="featured-title"
          title={dict.home.featuredTitle}
          intro={dict.home.featuredIntro}
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((illustration, index) => (
            <IllustrationCard
              key={illustration.slug}
              illustration={illustration}
              locale={locale}
              priority={index < 3}
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/illustrations`}
            className="btn-honey inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold"
          >
            {dict.common.discoverAll}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------------------- Collections --------------------------- */}
      <section
        aria-labelledby="collections-title"
        className="mx-auto max-w-[1300px] px-6 py-20 sm:px-10 lg:pl-[230px]"
      >
        <SectionHeading
          id="collections-title"
          title={dict.home.collectionsTitle}
          intro={dict.home.collectionsIntro}
        />
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/${locale}/collections/${collection.slug}`}
              className="illu-card stitched group flex flex-col items-center rounded-[2.2rem] p-7 text-center"
              style={{ backgroundColor: collection.tint }}
            >
              <span
                className="relative z-10 block h-28 w-28 overflow-hidden rounded-full shadow-plush transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: collection.tint }}
              >
                <Image
                  src={`/illustrations/${collection.coverIllustrationSlug}/thumb.webp`}
                  alt=""
                  width={320}
                  height={320}
                  sizes="112px"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="font-display relative z-10 mt-5 text-xl font-semibold text-rose">
                {collection.name}
              </span>
              <span className="relative z-10 mt-2 text-sm leading-relaxed text-rose-ink/90">
                {collection.subtitle[locale]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------- Célébrations --------------------------- */}
      <section
        aria-labelledby="celebrations-title"
        className="mx-auto max-w-[1300px] px-6 py-20 sm:px-10 lg:pl-[230px]"
      >
        <SectionHeading
          id="celebrations-title"
          title={dict.home.celebrationsTitle}
          intro={dict.home.celebrationsIntro}
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {celebrations.map((celebration) => (
            <li key={celebration.slug}>
              <Link
                href={`/${locale}/celebrations/${celebration.slug}`}
                className="illu-card flex h-full items-start gap-4 rounded-[1.8rem] border border-rose/10 p-5"
                style={{ backgroundColor: celebration.tint }}
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory/90 text-xl shadow-sm"
                >
                  {celebration.icon}
                </span>
                <span>
                  <span className="font-display block text-lg font-semibold text-rose">
                    {celebration.name[locale]}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-rose-ink/90">
                    {celebration.description[locale]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------- Mon histoire -------------------------- */}
      <section
        aria-labelledby="story-title"
        className="mx-auto max-w-[1300px] px-6 py-20 sm:px-10 lg:pl-[230px]"
      >
        <div className="stitched mx-auto grid max-w-4xl items-center gap-8 rounded-[2.5rem] p-8 sm:p-12 md:grid-cols-[auto_1fr]">
          <div className="relative z-10 mx-auto h-40 w-40 overflow-hidden rounded-full shadow-plush md:h-48 md:w-48">
            <Image
              src="/illustrations/abeille-sereine/card.webp"
              alt={dict.home.heroAlt}
              width={800}
              height={800}
              sizes="192px"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10">
            <h2
              id="story-title"
              className="text-3xl font-semibold text-rose"
            >
              {dict.home.storyTitle}
            </h2>
            <p className="mt-4 leading-relaxed">{dict.home.storyTeaser}</p>
            <Link
              href={`/${locale}/mon-histoire`}
              className="btn-ghost mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              {dict.home.storyLink}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
