import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { AccountView } from "@/components/account/AccountView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return { title: dict.meta.accountTitle, robots: { index: false } };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[900px] px-6 py-14 sm:px-10">
      <h1 className="text-4xl font-semibold text-rose">
        {dict.account.title}
      </h1>
      <AccountView />
    </div>
  );
}
