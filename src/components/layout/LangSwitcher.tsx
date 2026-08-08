"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { locales, type Locale } from "@/lib/i18n/config";
import { GlobeIcon } from "@/components/Icons";

function persistLocaleCookie(next: Locale) {
  document.cookie = `MLLE_LOCALE=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function LangSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    persistLocaleCookie(next);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label={dict.nav.language}>
      <GlobeIcon className="h-4 w-4 opacity-70" />
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            l === locale
              ? "bg-[#D77A63] text-ivory"
              : "text-[#8B4513] hover:bg-[#D77A63]/10 hover:text-[#D77A63]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
