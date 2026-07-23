"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  BookIcon,
  CloseIcon,
  FlowerIcon,
  GiftIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/Icons";
import { LangSwitcher } from "./LangSwitcher";
import { SoundToggle } from "./SoundToggle";

/** Accessible drawer menu for small screens (native <dialog>). */
export function MobileNav() {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const items = [
    { href: `/${locale}/illustrations`, label: dict.nav.illustrations, icon: SearchIcon },
    { href: `/${locale}/collections`, label: dict.nav.collections, icon: FlowerIcon },
    { href: `/${locale}/celebrations`, label: dict.nav.celebrations, icon: GiftIcon },
    { href: `/${locale}/mon-histoire`, label: dict.nav.story, icon: BookIcon },
    { href: `/${locale}/favoris`, label: dict.nav.favorites, icon: HeartIcon },
    { href: `/${locale}/compte`, label: dict.nav.account, icon: UserIcon },
  ];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.nav.openMenu}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#88664E] transition-colors hover:bg-[#D77A63]/10 hover:text-[#D77A63]"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        aria-label={dict.nav.menu}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-[#88664E]/30 backdrop:backdrop-blur-[2px]"
      >
        <div className="stitched ml-auto flex h-full w-[300px] flex-col gap-2 overflow-y-auto rounded-l-[2rem] p-6">
          <div className="relative z-10 mb-2 flex items-center justify-between">
            <span className="font-display text-lg font-semibold text-[#D77A63]">
              MlleLAbeille
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.nav.closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#88664E] transition-colors hover:bg-[#D77A63]/10 hover:text-[#D77A63]"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label={dict.nav.menu} className="relative z-10">
            <ul className="space-y-1">
              {items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith(href) ? "page" : undefined}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold text-[#88664E] transition-colors hover:bg-[#D77A63]/10 hover:text-[#D77A63] aria-[current=page]:text-[#D77A63]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-honey-whisper text-honey-deep">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 mt-auto flex items-center justify-between border-t border-[#D77A63]/10 pt-4">
            <LangSwitcher />
            <SoundToggle />
          </div>
        </div>
      </dialog>
    </div>
  );
}
