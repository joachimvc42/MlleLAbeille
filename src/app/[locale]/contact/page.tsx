import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return {
    title: dict.meta.contactTitle,
    alternates: {
      canonical: `/${raw}/contact`,
      languages: { fr: "/fr/contact", en: "/en/contact" },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[700px] px-6 py-16 sm:px-10">
      <h1 className="text-center text-4xl font-semibold text-rose">
        {dict.contact.title}
      </h1>
      <p className="mt-4 text-center leading-relaxed">{dict.contact.intro}</p>
      <div className="stitched mt-10 rounded-[2.2rem] p-8 sm:p-10">
        <ContactForm />
      </div>
    </div>
  );
}
