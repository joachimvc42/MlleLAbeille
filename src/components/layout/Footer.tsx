import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/lib/i18n/config";
import { BeeLogo } from "@/components/BeeLogo";
import { NewsletterForm } from "@/components/NewsletterForm";
import { HoneyDivider } from "@/components/HoneyDivider";

export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  const explore = [
    { href: `/${locale}/illustrations`, label: dict.nav.illustrations, cmsKey: `nav-illustrations-${locale}` },
    { href: `/${locale}/collections`, label: dict.nav.collections, cmsKey: `nav-collections-${locale}` },
    { href: `/${locale}/celebrations`, label: dict.nav.celebrations, cmsKey: `nav-celebrations-${locale}` },
    { href: `/${locale}/mon-histoire`, label: dict.nav.story, cmsKey: `nav-story-${locale}` },
  ];
  const help = [
    { href: `/${locale}/contact`, label: dict.footer.contact, cmsKey: `footer-contact-${locale}` },
    { href: `/${locale}/compte`, label: dict.nav.account, cmsKey: `nav-account-${locale}` },
    { href: `/${locale}/favoris`, label: dict.nav.favorites, cmsKey: `nav-favorites-${locale}` },
    { href: `/${locale}/panier`, label: dict.nav.cart, cmsKey: `nav-cart-${locale}` },
  ];

  return (
    <footer
      className="relative mt-24 border-t border-rose/10 bg-paper"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(246,237,218,.4), rgba(232,213,177,.55))",
      }}
    >
      <HoneyDivider className="absolute inset-x-0 top-0" />

      <div className="relative z-10 mx-auto grid max-w-[1200px] gap-10 px-6 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
        <div>
          <div className="flex items-center gap-3">
            <BeeLogo className="h-10 w-10" />
            <span className="font-display text-lg font-semibold text-rose">
              Mademoiselle l’Abeille
            </span>
          </div>
          <p data-cms={`footer-baseline-${locale}`} className="mt-4 max-w-xs text-sm leading-relaxed">
            {dict.footer.baseline}
          </p>
        </div>

        <nav aria-label={dict.footer.explore}>
          <h2 data-cms={`footer-explore-title-${locale}`} className="font-display text-base font-semibold text-rose">
            {dict.footer.explore}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {explore.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-rose"
                >
                  <span data-cms={item.cmsKey}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.help}>
          <h2 data-cms={`footer-help-title-${locale}`} className="font-display text-base font-semibold text-rose">
            {dict.footer.help}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {help.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-rose"
                >
                  <span data-cms={item.cmsKey}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 data-cms={`footer-newsletter-title-${locale}`} className="font-display text-base font-semibold text-rose">
            {dict.home.newsletterTitle}
          </h2>
          <p data-cms={`footer-newsletter-text-${locale}`} className="mt-4 text-sm leading-relaxed">
            {dict.home.newsletterText}
          </p>
          <div className="mt-4">
            <NewsletterForm compact />
          </div>
        </div>
      </div>

      <div className="border-t border-rose/10 py-5 text-center text-xs text-rose-ink/70">
        © {year} MlleLAbeille · <span data-cms={`footer-copyright-${locale}`}>{dict.footer.copyright}</span> <span data-cms={`footer-madewith-${locale}`}>{dict.footer.madeWith}</span>
      </div>
    </footer>
  );
}
