import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return { title: dict.checkout.confirmationTitle, robots: { index: false } };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const [{ locale: raw }, { ref }] = await Promise.all([params, searchParams]);
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[640px] px-6 py-20 text-center sm:px-10">
      <div className="mx-auto h-36 w-36 overflow-hidden rounded-full shadow-plush-lg">
        <Image
          src="/illustrations/abeille-sereine/card.webp"
          alt={dict.home.heroAlt}
          width={800}
          height={800}
          priority
          sizes="144px"
          className="h-full w-full object-cover"
        />
      </div>
      <h1 className="mt-8 text-4xl font-semibold text-rose">
        {dict.checkout.confirmationTitle}
      </h1>
      <p className="mt-4 leading-relaxed">{dict.checkout.confirmationText}</p>
      {ref && (
        <p className="mt-6 inline-block rounded-full bg-honey-whisper px-5 py-2.5 font-semibold">
          {dict.checkout.orderRef} : <span className="font-mono">{ref}</span>
        </p>
      )}
      <div className="mt-10">
        <Link
          href={`/${locale}/illustrations`}
          className="btn-rose inline-block px-7 py-3.5 font-semibold"
        >
          {dict.checkout.backToShop}
        </Link>
      </div>
    </div>
  );
}
