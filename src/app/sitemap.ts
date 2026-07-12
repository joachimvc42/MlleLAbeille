import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import {
  getCelebrations,
  getCollections,
  getIllustrations,
} from "@/lib/catalogue";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mllelabeille.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [illustrations, collections, celebrations] = await Promise.all([
    getIllustrations(),
    getCollections(),
    getCelebrations(),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const localizedPaths = (path: string) =>
    Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`]));

  const push = (path: string, priority: number) => {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        priority,
        alternates: { languages: localizedPaths(path) },
      });
    }
  };

  push("", 1);
  push("/illustrations", 0.9);
  push("/collections", 0.8);
  push("/celebrations", 0.8);
  push("/mon-histoire", 0.7);
  push("/contact", 0.5);

  for (const illustration of illustrations) {
    push(`/illustrations/${illustration.slug}`, 0.8);
  }
  for (const collection of collections) {
    push(`/collections/${collection.slug}`, 0.7);
  }
  for (const celebration of celebrations) {
    push(`/celebrations/${celebration.slug}`, 0.7);
  }

  return entries;
}
