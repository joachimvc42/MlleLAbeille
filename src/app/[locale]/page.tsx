export const revalidate = 300;

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
import { ScallopDivider } from "@/components/ScallopDivider";
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
    <main className="home-page-shell">
      <OrganizationJsonLd />
      <WebsiteJsonLd locale={locale} />

      {/* ------------------------------- Hero ------------------------------ */}
      <section
        aria-labelledby="hero-title"
        className="home-hero mx-auto grid min-h-[calc(100dvh-72px)] max-w-[1440px] items-center gap-8 overflow-hidden px-6 py-10 sm:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:pl-[230px]"
      >
        <div className="relative z-10 max-w-xl lg:pl-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-honey-deep">
            {dict.common.tagline}
          </p>
          <h1
            id="hero-title"
            className="text-4xl font-medium leading-[1.13] text-cocoa sm:text-5xl lg:text-[3.4rem]"
          >
            {dict.home.heroTitle}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cocoa-soft sm:text-xl">
            {dict.home.heroText}
          </p>
          <div
            aria-hidden="true"
            className="botanical-divider mt-7"
          />
          <Link
            href={`/${locale}/illustrations`}
            className="btn-sage mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold"
          >
            {dict.home.heroCta}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <HeroScene beeAlt={dict.home.heroAlt} />
      </section>

      {/* ----------------------- Collection printemps --------------------- */}
      <section className="seasonal-section mx-auto max-w-[1300px] px-6 py-16 sm:px-10 lg:pl-[230px]">
        <Link
          href={`/${locale}/collections`}
          className="seasonal-card group grid overflow-hidden rounded-[2.7rem] lg:grid-cols-[0.38fr_0.62fr]"
        >
          <span className="relative z-10 flex flex-col justify-center p-8 sm:p-12">
            <span className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-honey-deep">
              {locale === "fr" ? "Nouvelle collection" : "New collection"}
            </span>
            <span className="font-display text-3xl text-cocoa sm:text-4xl">
              {locale === "fr" ? "Le printemps des petites abeilles" : "The little bees’ spring"}
            </span>
            <span className="mt-4 max-w-sm leading-relaxed text-cocoa-soft">
              {locale === "fr"
                ? "Jardiner, lire, flâner au soleil… une collection tendre déclinée au féminin comme au masculin."
                : "Gardening, reading, lingering in the sun… a gentle collection with feminine and masculine characters."}
            </span>
            <span className="mt-7 inline-flex items-center gap-2 font-semibold text-olive">
              {locale === "fr" ? "Découvrir la collection" : "Discover the collection"}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </span>
          <span className="relative min-h-[310px] overflow-hidden sm:min-h-[390px]">
            <Image
              src="/brand/collection-printemps.webp"
              alt={locale === "fr" ? "Collection printemps des petites abeilles" : "Little bees spring collection"}
              fill
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.018]"
            />
          </span>
        </Link>
      </section>

      {/* --------------------------- Featured six -------------------------- */}
      {/* The pantry: a sunlit shelf where the illustrations are set out. */}
      <div className="room-honey textured-room relative">
        <ScallopDivider color="#faf0d8" className="absolute -top-[25px] left-0" />
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
      </div>

      {/* ---------------------------- Collections --------------------------- */}
      {/* The sunroom: the illustrated worlds, shelved like glazed pottery. */}
      <div className="room-sage textured-room relative">
        <ScallopDivider color="#e4ebdd" className="absolute -top-[25px] left-0" />
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
                className="illu-card collection-paper-card weave-surface group flex flex-col items-center rounded-[2.2rem] p-7 text-center"
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
      </div>

      {/* ---------------------------- Célébrations --------------------------- */}
      {/* The nursery corner: soft light, gift ribbons, quiet celebration. */}
      <div className="room-sky textured-room relative">
        <ScallopDivider color="#eaf2f7" className="absolute -top-[25px] left-0" />
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
                  className="illu-card celebration-paper-card weave-surface flex h-full items-start gap-4 rounded-[1.8rem] p-5"
                  style={{ backgroundColor: celebration.tint }}
                >
                  <span
                    aria-hidden="true"
                    className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory/90 text-xl shadow-sm"
                  >
                    {celebration.icon}
                  </span>
                  <span className="relative z-10">
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
      </div>

      {/* ----------------------------- Mon histoire -------------------------- */}
      {/* The keepsake nook: warm, intimate, close to the wall again. */}
      <div className="room-rose textured-room relative">
        <ScallopDivider color="#f7e9e6" className="absolute -top-[25px] left-0" />
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
              <h2 id="story-title" className="text-3xl font-semibold text-rose">
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
      </div>
    </main>
  );
}
