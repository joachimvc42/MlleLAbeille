"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface Row {
  id: string;
  slug: string;
  title: Record<string, string>;
  status: "draft" | "published";
  featured: boolean;
  featured_order: number | null;
  is_placeholder: boolean;
}

export function AdminIllustrations() {
  const { locale, dict } = useI18n();
  const supabase = getSupabaseBrowserClient();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("illustrations")
      .select("id, slug, title, status, featured, featured_order, is_placeholder")
      .order("featured", { ascending: false })
      .order("featured_order", { ascending: true, nullsFirst: false })
      .order("slug")
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setRows((data as Row[]) ?? []);
      });
  }, [supabase]);

  async function update(id: string, patch: Partial<Row>) {
    if (!supabase || !rows) return;
    setSavingId(id);
    const { error: err } = await supabase
      .from("illustrations")
      .update(patch)
      .eq("id", id);
    if (!err) {
      setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }
    setSavingId(null);
  }

  if (error) {
    return <p className="text-sm text-rose-deep">{dict.admin.loadError}</p>;
  }
  if (!rows) {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-rose-ink/80">
        {dict.admin.illustrationsHelp}
      </p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="stitched flex flex-wrap items-center gap-4 rounded-[1.6rem] p-4"
          >
            <span className="relative z-10 block h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-sm">
              <Image
                src={`/illustrations/${row.slug}/thumb.webp`}
                alt=""
                width={320}
                height={320}
                sizes="56px"
                className="h-full w-full object-cover"
              />
            </span>

            <span className="relative z-10 min-w-0 flex-1">
              <span className="font-display block truncate font-semibold text-rose">
                {row.title[locale] ?? row.title.fr ?? row.slug}
              </span>
              <span className="block truncate text-xs text-rose-ink/60">
                {row.slug}
                {row.is_placeholder && (
                  <span className="ml-2 rounded-full bg-honey-whisper px-2 py-0.5 font-semibold">
                    {dict.admin.placeholderBadge}
                  </span>
                )}
              </span>
            </span>

            {/* Status toggle */}
            <button
              type="button"
              disabled={savingId === row.id}
              onClick={() =>
                update(row.id, {
                  status: row.status === "published" ? "draft" : "published",
                })
              }
              className={`relative z-10 rounded-full px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                row.status === "published"
                  ? "bg-sage-soft text-[#4c6a3f]"
                  : "bg-rose-whisper text-rose-deep"
              }`}
            >
              {row.status === "published"
                ? `● ${dict.admin.statusPublished}`
                : `○ ${dict.admin.statusDraft}`}
            </button>

            {/* Featured toggle */}
            <label className="relative z-10 flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={row.featured}
                disabled={savingId === row.id}
                onChange={(e) => update(row.id, { featured: e.target.checked })}
                className="h-4 w-4 accent-[#C98781]"
              />
              {dict.admin.columnFeatured}
            </label>

            {/* Featured order */}
            <label className="relative z-10 flex items-center gap-2 text-xs font-semibold">
              {dict.admin.columnFeaturedOrder}
              <input
                type="number"
                min={1}
                max={99}
                value={row.featured_order ?? ""}
                disabled={savingId === row.id || !row.featured}
                onChange={(e) =>
                  update(row.id, {
                    featured_order: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-16 rounded-xl border border-rose/20 bg-ivory px-2 py-1.5 text-sm disabled:opacity-40"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
