"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { BeeMiniIcon, FlowerIcon, GiftIcon } from "@/components/Icons";
import { FloralSprig } from "@/components/decor/FloralSprig";

/*
 * The bookmark: a suede tag hanging from a cord below the header, its hem
 * stitched, garnished with floral sprigs — a charming object pinned to the
 * wall of the house. The tag is vertical; every label stays horizontal.
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
      className="fixed left-7 top-[76px] z-30 hidden w-[150px] lg:block"
    >
      {/* cord */}
      <svg
        aria-hidden="true"
        viewBox="0 0 150 34"
        className="relative left-0 block h-[34px] w-full"
      >
        <path
          d="M75 0 C 68 10, 66 18, 71 30 M75 0 C 82 12, 84 20, 79 30"
          stroke="#C8A87C"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <div className="suede relative -mt-px rounded-[3.2rem] px-3 pb-7 pt-5">
        {/* punched hole the cord passes through */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-3.5 z-10 block h-4 w-4 -translate-x-1/2 rounded-full border border-[#d9c39a] bg-[#f8efdd] shadow-[inset_0_1px_2px_rgba(125,93,72,0.35)]"
        />

        <FloralSprig className="relative z-10 mx-auto mt-4 h-6 w-14 opacity-80" />

        <ul className="relative z-10 mt-1 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex flex-col items-center gap-1.5 rounded-3xl px-2 py-3.5 text-center transition-all hover:-translate-y-0.5 hover:bg-ivory/70 ${
                    active ? "bg-ivory/80 shadow-sm" : ""
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      active ? "text-rose" : "text-rose/70 group-hover:text-rose"
                    }`}
                  />
                  <span className="text-[0.82rem] font-semibold leading-tight text-rose-ink">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <FloralSprig flip className="relative z-10 mx-auto mt-3 h-6 w-14 opacity-80" />
      </div>
    </nav>
  );
}
