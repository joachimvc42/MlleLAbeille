"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { SearchIcon } from "@/components/Icons";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (q) router.push(`/${locale}/recherche?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        {dict.nav.searchLabel}
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={dict.nav.searchPlaceholder}
        autoFocus={!initialQuery}
        className="w-full rounded-full border border-rose/25 bg-ivory py-3.5 pl-6 pr-14 shadow-plush placeholder:text-rose-ink/45 focus:border-rose"
      />
      <button
        type="submit"
        aria-label={dict.nav.searchLabel}
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-rose text-ivory transition-colors hover:bg-rose-deep"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
