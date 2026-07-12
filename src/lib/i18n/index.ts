import { fr, type Dictionary } from "./dictionaries/fr";
import { en } from "./dictionaries/en";
import type { Locale } from "./config";

export * from "./config";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.fr;
}

/** Replace `{key}` tokens in a dictionary string. */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
