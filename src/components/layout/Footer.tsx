import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/lib/i18n/config";
import { BeeLogo } from "@/components/BeeLogo";
import { NewsletterForm } from "@/components/NewsletterForm";

export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  const explore = [
    { href: `/${locale}/illustrations`, label: dict.nav.illustrations },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/celebrations`, label: dict.nav.celebrations },
    { href: `/${locale}/mon-histoire`, label: dict.nav.story },
  ];
  const help = [
    { href: `/${locale}/contact`, label: dict.footer.contact },
    { href: `/${locale}/compte`, label: dict.nav.account },
    { href: `/${locale}/favoris`, label: dict.nav.favorites },
    { href: `/${locale}/panier`, label: dict.nav.cart },
  ];

  return (
    <footer className="relative mt-24 border-t border-rose/10 bg-ivory/70">
      {/* soft scalloped edge */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 30"
        preserveAspectRatio="none"
        className="absolute -top-[29px] left-0 h-[30px] w-full text-ivory/70"
      >
        <path
          d="M0 30 Q 30 0 60 30 T 120 30 T 180 30 T 240 30 T 300 30 T 360 30 T 420 30 T 480 30 T 540 30 T 600 30 T 660 30 T 720 30 T 780 30 T 840 30 T 900 30 T 960 30 T 1020 30 T 1080 30 T 1140 30 T 1200 30 Z"
          fill="currentColor"
        />
      </svg>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
        <div>
          <div className="flex items-center gap-3">
            <BeeLogo className="h-10 w-10" />
            <span className="font-display text-lg font-semibold text-rose">
              Mademoiselle l’Abeille
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {dict.footer.baseline}
          </p>
        </div>

        <nav aria-label={dict.footer.explore}>
          <h2 className="font-display text-base font-semibold text-rose">
            {dict.footer.explore}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {explore.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-rose"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.help}>
          <h2 className="font-display text-base font-semibold text-rose">
            {dict.footer.help}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {help.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-rose"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-semibold text-rose">
            {dict.home.newsletterTitle}
          </h2>
          <p className="mt-4 text-sm leading-relaxed">
            {dict.home.newsletterText}
          </p>
          <div className="mt-4">
            <NewsletterForm compact />
          </div>
        </div>
      </div>

      <div className="border-t border-rose/10 py-5 text-center text-xs text-rose-ink/70">
        © {year} MlleLAbeille · {dict.footer.copyright} {dict.footer.madeWith}
      </div>
    </footer>
  );
}
