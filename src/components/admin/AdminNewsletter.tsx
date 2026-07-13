"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface Row {
  id: string;
  email: string;
  locale: string;
  created_at: string;
}

export function AdminNewsletter() {
  const { locale, dict } = useI18n();
  const supabase = getSupabaseBrowserClient();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("newsletter_subscribers")
      .select("id, email, locale, created_at")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setRows((data as Row[]) ?? []);
      });
  }, [supabase]);

  if (error) {
    return <p className="text-sm text-rose-deep">{dict.admin.loadError}</p>;
  }
  if (!rows) {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-ivory/70 p-8 text-center text-sm">
        {dict.admin.noSubscribers}
      </p>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-rose-ink/80">
        {dict.admin.newsletterHelp} ({rows.length})
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-ivory/80 px-4 py-3 text-sm shadow-sm"
          >
            <span className="truncate font-semibold">{row.email}</span>
            <span className="shrink-0 text-xs text-rose-ink/60">
              {row.locale.toUpperCase()} · {dict.admin.subscribedOn}{" "}
              {new Date(row.created_at).toLocaleDateString(
                locale === "fr" ? "fr-FR" : "en-GB",
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
