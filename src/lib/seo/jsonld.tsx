import type { Illustration, ProductType } from "@/lib/catalogue/types";
import type { Locale } from "@/lib/i18n/config";
import { CURRENCY, lowestPriceCents } from "@/lib/catalogue/types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mllelabeille.vercel.app";

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "MlleLAbeille",
        alternateName: "Mademoiselle l’Abeille",
        url: siteUrl,
        logo: `${siteUrl}/illustrations/abeille-sereine/thumb.webp`,
      }}
    />
  );
}

export function WebsiteJsonLd({ locale }: { locale: Locale }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "MlleLAbeille",
        url: `${siteUrl}/${locale}`,
        inLanguage: locale === "fr" ? "fr-FR" : "en-GB",
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/${locale}/recherche?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ProductJsonLd({
  illustration,
  products,
  locale,
}: {
  illustration: Illustration;
  products: ProductType[];
  locale: Locale;
}) {
  const price = lowestPriceCents(illustration, products);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: illustration.title[locale],
        description: illustration.description[locale],
        image: `${siteUrl}${illustration.image.src}`,
        url: `${siteUrl}/${locale}/illustrations/${illustration.slug}`,
        brand: { "@type": "Brand", name: "MlleLAbeille" },
        ...(price !== null && {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: CURRENCY,
            lowPrice: (price / 100).toFixed(2),
            availability: "https://schema.org/InStock",
          },
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.path}`,
        })),
      }}
    />
  );
}
