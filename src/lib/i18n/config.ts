export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** A piece of copy available in every supported language. */
export type LocalizedText = Record<Locale, string>;

export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text[defaultLocale];
}
