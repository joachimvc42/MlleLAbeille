export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getCelebrations } from "@/lib/catalogue";
import { SectionHeading } from "@/components/SectionHeading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return {
    title: dict.meta.celebrationsTitle,
    description: dict.meta.celebrationsDescription,
    alternates: {
      canonical: `/${raw}/celebrations`,
      languages: { fr: "/fr/celebrations", en: "/en/celebrations" },
    },
  };
}

export default async function CelebrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const celebrations = await getCelebrations();

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-14 sm:px-10 lg:pl-[230px]">
      <SectionHeading
        title={dict.home.celebrationsTitle}
        intro={dict.home.celebrationsIntro}
      />

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {celebrations.map((celebration) => (
          <li key={celebration.slug}>
            <Link
              href={`/${locale}/celebrations/${celebration.slug}`}
              className="illu-card stitched flex h-full flex-col items-center rounded-[2rem] p-8 text-center"
              style={{ backgroundColor: celebration.tint }}
            >
              <span
                aria-hidden="true"
                className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-ivory/90 text-3xl shadow-sm"
              >
                {celebration.icon}
              </span>
              <span className="font-display relative z-10 mt-4 text-xl font-semibold text-rose">
                {celebration.name[locale]}
              </span>
              <span className="relative z-10 mt-2 text-sm leading-relaxed text-rose-ink/90">
                {celebration.description[locale]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
