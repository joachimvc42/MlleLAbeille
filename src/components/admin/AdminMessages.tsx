"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface Row {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export function AdminMessages() {
  const { locale, dict } = useI18n();
  const supabase = getSupabaseBrowserClient();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("contact_messages")
      .select("id, name, email, message, handled, created_at")
      .order("handled")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setRows((data as Row[]) ?? []);
      });
  }, [supabase]);

  async function markHandled(id: string) {
    if (!supabase || !rows) return;
    const { error: err } = await supabase
      .from("contact_messages")
      .update({ handled: true })
      .eq("id", id);
    if (!err) {
      setRows(rows.map((r) => (r.id === id ? { ...r, handled: true } : r)));
    }
  }

  if (error) {
    return <p className="text-sm text-rose-deep">{dict.admin.loadError}</p>;
  }
  if (!rows) {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="paper-panel rounded-2xl p-8 text-center text-sm">
        {dict.admin.noMessages}
      </p>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-rose-ink/80">{dict.admin.messagesHelp}</p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`stitched rounded-[1.6rem] p-5 ${row.handled ? "opacity-60" : ""}`}
          >
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-rose">
                {row.name}{" "}
                <a
                  href={`mailto:${row.email}`}
                  className="ml-1 text-xs font-normal text-rose-ink/70 underline-offset-4 hover:underline"
                >
                  {row.email}
                </a>
              </p>
              <p className="text-xs text-rose-ink/60">
                {new Date(row.created_at).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-GB",
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </p>
            </div>
            <p className="relative z-10 mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {row.message}
            </p>
            <div className="relative z-10 mt-4">
              {row.handled ? (
                <span className="rounded-full bg-sage-soft px-3 py-1.5 text-xs font-semibold text-[#4c6a3f]">
                  ✓ {dict.admin.handled}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => markHandled(row.id)}
                  className="btn-ghost px-4 py-2 text-xs font-semibold"
                >
                  {dict.admin.markHandled}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
