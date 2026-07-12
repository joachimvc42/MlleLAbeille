"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { BeeMiniIcon, FlowerIcon, GiftIcon } from "@/components/Icons";

/**
 * The vertical navigation tag pinned to the left of the illustrated world
 * on desktop. The bar is vertical; every label stays horizontal.
 */
export function SideNav() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();

  const items = [
    {
      href: `/${locale}/collections`,
      label: dict.nav.collections,
      icon: FlowerIcon,
    },
    {
      href: `/${locale}/celebrations`,
      label: dict.nav.celebrations,
      icon: GiftIcon,
    },
    {
      href: `/${locale}/mon-histoire`,
      label: dict.nav.story,
      icon: BeeMiniIcon,
    },
  ];

  return (
    <nav
      aria-label={dict.nav.menu}
      className="stitched fixed left-5 top-1/2 z-30 hidden w-[180px] -translate-y-1/2 rounded-[2.4rem] p-3.5 lg:block"
    >
      <ul className="relative z-10 space-y-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-2.5 rounded-3xl px-3 py-3 text-sm font-semibold transition-all hover:translate-x-0.5 hover:bg-ivory/80 ${
                  active ? "bg-ivory/90 shadow-sm" : ""
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    active
                      ? "bg-honey text-[#5c4321]"
                      : "bg-honey-whisper text-honey-deep group-hover:bg-honey-soft"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-rose-ink">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
