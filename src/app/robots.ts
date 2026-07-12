import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mllelabeille.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*/panier", "/*/commande", "/*/compte", "/*/recherche"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
