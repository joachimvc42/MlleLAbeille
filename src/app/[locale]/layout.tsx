import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lora, Quicksand } from "next/font/google";
import "../globals.css";

import { getDictionary } from "@/lib/i18n";
import { isLocale, locales } from "@/lib/i18n/config";
import { Providers } from "@/components/Providers";
import { CustomCursor } from "@/components/CustomCursor";
import { TopBar } from "@/components/layout/TopBar";
import { SideNav } from "@/components/layout/SideNav";
import { Footer } from "@/components/layout/Footer";
import { PageBlooms } from "@/components/decor/PageBlooms";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mllelabeille.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "fr");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.meta.homeTitle,
      template: "%s · MlleLAbeille",
    },
    description: dict.meta.homeDescription,
    applicationName: dict.meta.siteName,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      images: [
        {
          url: "/illustrations/abeille-sereine/card.webp",
          width: 800,
          height: 800,
          alt: dict.home.heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${lora.variable} ${quicksand.variable}`}>
      <body className="paper-grain min-h-dvh">
        <Providers locale={locale} dict={dict}>
          <CustomCursor />
          <a href="#contenu" className="skip-link">
            {dict.nav.skipToContent}
          </a>
          <PageBlooms />
          <TopBar />
          <SideNav />
          <main id="contenu" className="pt-[72px]">
            {children}
          </main>
          <Footer locale={locale} dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
