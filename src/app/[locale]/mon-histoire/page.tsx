import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ArrowRightIcon } from "@/components/Icons";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return {
    title: dict.meta.storyTitle,
    description: dict.story.metaDescription,
    alternates: {
      canonical: `/${raw}/mon-histoire`,
      languages: { fr: "/fr/mon-histoire", en: "/en/mon-histoire" },
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[900px] px-6 py-16 sm:px-10">
      <BreadcrumbJsonLd
        items={[
          { name: dict.common.brand, path: `/${locale}` },
          { name: dict.story.title, path: `/${locale}/mon-histoire` },
        ]}
      />

      <header className="text-center">
        <div className="mx-auto h-44 w-44 overflow-hidden rounded-full shadow-plush-lg">
          <Image
            src="/illustrations/abeille-sereine/card.webp"
            alt={dict.home.heroAlt}
            width={800}
            height={800}
            priority
            sizes="176px"
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="mt-8 text-4xl font-semibold text-rose sm:text-5xl">
          {dict.story.title}
        </h1>
        <div
          aria-hidden="true"
          className="mt-4 flex items-center justify-center gap-3 text-rose/50"
        >
          <span className="h-px w-16 bg-current opacity-50" />
          <span className="text-sm">♥</span>
          <span className="h-px w-16 bg-current opacity-50" />
        </div>
      </header>

      <div className="stitched mt-12 rounded-[2.5rem] p-8 sm:p-14">
        <div className="relative z-10 space-y-6 text-lg leading-relaxed">
          {dict.story.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={index === 0 ? "font-display text-xl text-rose" : ""}
            >
              {paragraph}
            </p>
          ))}
          <p className="pt-2 text-right font-display italic text-rose">
            {dict.story.signature}
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href={`/${locale}/illustrations`}
          className="btn-rose inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold"
        >
          {dict.common.discoverAll}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
