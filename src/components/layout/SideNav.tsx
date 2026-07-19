"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { BookIcon, FlowerIcon, GiftIcon } from "@/components/Icons";

/*
 * The bookmark navigation is the real painted artwork from the reference:
 * a suede tag hung on knotted twine, hand-stitched hem, embossed grain,
 * wildflower sprigs and its own soft shadow on the wall. The painted
 * icon/label zones were cleaned out of the artwork so these interactive,
 * localized links can live on top of it. Labels stay horizontal.
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
      icon: BookIcon,
    },
  ];

  return (
    <nav
      aria-label={dict.nav.menu}
      className="fixed left-6 top-[70px] z-30 hidden w-[150px] lg:block"
    >
      <div className="relative select-none">
        <Image
          src="/brand/bookmark.webp"
          alt=""
          width={196}
          height={740}
          priority
          sizes="150px"
          className="h-auto w-full [filter:drop-shadow(0_14px_24px_rgba(125,93,72,0.28))]"
        />
        <ul className="absolute inset-x-3 top-[172px] flex h-[268px] flex-col justify-between">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors hover:bg-white/45 ${
                    active ? "bg-white/55" : ""
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      active
                        ? "text-rose"
                        : "text-[#a87a58] group-hover:text-rose"
                    }`}
                  />
                  <span className="text-[0.8rem] font-medium leading-tight text-cocoa-soft">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
