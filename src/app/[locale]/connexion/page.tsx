import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { AuthForm } from "@/components/auth/AuthForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : "fr");
  return { title: dict.auth.signInTitle, robots: { index: false } };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[460px] px-6 py-20 sm:px-10">
      <h1 className="text-center text-3xl font-semibold text-rose">
        {dict.auth.signInTitle}
      </h1>
      <div className="stitched mt-8 rounded-[2.2rem] p-8">
        <AuthForm mode="signin" />
      </div>
    </div>
  );
}
