"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/cart/CartProvider";
import { BeeLogo } from "@/components/BeeLogo";
import {
  BagIcon,
  HeartIcon,
  SearchIcon,
  UserIcon,
} from "@/components/Icons";
import { LangSwitcher } from "./LangSwitcher";
import { SoundToggle } from "./SoundToggle";
import { MobileNav } from "./MobileNav";

export function TopBar() {
  const { locale, dict } = useI18n();
  const { count, ready } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (q) router.push(`/${locale}/recherche?q=${encodeURIComponent(q)}`);
    else router.push(`/${locale}/recherche`);
  }

  const action =
    "relative flex h-10 items-center justify-center gap-1.5 rounded-full px-2.5 text-rose-ink transition-colors hover:bg-rose-whisper";
  const actionLabel =
    "hidden whitespace-nowrap text-[0.85rem] font-semibold xl:block";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-rose/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link
          href={`/${locale}`}
          className="group flex min-w-0 items-center gap-3 md:shrink-0"
          aria-label={`${dict.common.brand} — ${dict.common.backHome}`}
        >
          <BeeLogo className="h-11 w-11 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="leading-tight">
            <span className="font-display block text-xl font-semibold text-rose">
              Mlle l’Abeille
              <span aria-hidden="true" className="ml-0.5 align-super text-[0.6rem]">
                ♥
              </span>
            </span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-rose/70">
              {dict.common.tagline}
            </span>
          </span>
        </Link>

        {/* Search, woven into the header like in the reference artwork */}
        <form
          onSubmit={submitSearch}
          role="search"
          className="relative hidden max-w-[340px] flex-1 md:block"
        >
          <label htmlFor="topbar-search" className="sr-only">
            {dict.nav.searchLabel}
          </label>
          <input
            id="topbar-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.nav.searchPlaceholder}
            className="h-11 w-full rounded-full border border-rose/25 bg-ivory/80 pl-5 pr-11 text-sm placeholder:text-rose-ink/45 focus:border-rose"
          />
          <button
            type="submit"
            aria-label={dict.nav.searchLabel}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-rose transition-colors hover:bg-rose-whisper"
          >
            <SearchIcon className="h-4.5 w-4.5" />
          </button>
        </form>

        <nav
          aria-label={dict.nav.menu}
          className="flex items-center gap-0.5 sm:gap-1"
        >
          <Link
            href={`/${locale}/recherche`}
            className={`${action} md:hidden`}
            aria-label={dict.nav.searchLabel}
            title={dict.nav.searchLabel}
          >
            <SearchIcon className="h-5 w-5" />
          </Link>

          <div className="hidden sm:block">
            <LangSwitcher />
          </div>

          <div className="hidden sm:block">
            <SoundToggle />
          </div>

          <Link
            href={`/${locale}/favoris`}
            className={`${action} hidden sm:flex`}
            aria-label={dict.nav.favorites}
            title={dict.nav.favorites}
          >
            <HeartIcon className="h-5 w-5" />
            <span className={actionLabel}>{dict.nav.favorites}</span>
          </Link>

          <Link
            href={`/${locale}/compte`}
            className={`${action} hidden sm:flex`}
            aria-label={dict.nav.account}
            title={dict.nav.account}
          >
            <UserIcon className="h-5 w-5" />
            <span className={actionLabel}>{dict.nav.account}</span>
          </Link>

          <Link
            href={`/${locale}/panier`}
            className={action}
            aria-label={dict.nav.cart}
            title={dict.nav.cart}
          >
            <BagIcon className="h-5 w-5" />
            <span className={actionLabel}>{dict.nav.cart}</span>
            {ready && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-honey px-1 text-[0.65rem] font-bold text-[#5c4321] shadow-sm"
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
