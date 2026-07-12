"use client";

import Link from "next/link";
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

  const action =
    "relative flex h-10 w-10 items-center justify-center rounded-full text-rose-ink transition-colors hover:bg-rose-whisper";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-rose/10 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-3"
          aria-label={`${dict.common.brand} — ${dict.common.backHome}`}
        >
          <BeeLogo className="h-11 w-11 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="leading-tight">
            <span className="font-display block text-xl font-semibold text-rose">
              Mlle l’Abeille
            </span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-rose/70">
              {dict.common.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label={dict.nav.menu}
          className="flex items-center gap-0.5 sm:gap-1.5"
        >
          <Link
            href={`/${locale}/recherche`}
            className={action}
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
          </Link>

          <Link
            href={`/${locale}/compte`}
            className={`${action} hidden sm:flex`}
            aria-label={dict.nav.account}
            title={dict.nav.account}
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          <Link
            href={`/${locale}/panier`}
            className={action}
            aria-label={dict.nav.cart}
            title={dict.nav.cart}
          >
            <BagIcon className="h-5 w-5" />
            {ready && count > 0 && (
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
