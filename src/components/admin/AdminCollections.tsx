"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Localized {
  fr?: string;
  en?: string;
}
interface Collection {
  id: string | null; // null = brand-new, not saved yet
  slug: string;
  name: string;
  subtitle: Localized;
  description: Localized;
  accent_color: string | null;
  tint_color: string | null;
  cover_illustration_slug: string | null;
  sort_order: number;
  seo_title: Localized;
  seo_description: Localized;
}
interface IllustrationOption {
  slug: string;
  title: Record<string, string>;
}

type LoadState = "loading" | "ready" | "no-supabase" | "error";

const EMPTY: Collection = {
  id: null,
  slug: "",
  name: "",
  subtitle: {},
  description: {},
  accent_color: "#c98781",
  tint_color: "#faf0d8",
  cover_illustration_slug: null,
  sort_order: 0,
  seo_title: {},
  seo_description: {},
};

/** Full collection manager: create, edit every field, delete. */
export function AdminCollections() {
  const { dict } = useI18n();
  const t = dict.admin.col;
  const [state, setState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<Collection[]>([]);
  const [illustrations, setIllustrations] = useState<IllustrationOption[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<{ key: string; msg: string } | null>(
    null,
  );

  const load = useCallback(() => {
    return fetch("/api/admin/collections")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((json) => {
        if (!json.configured) {
          setState("no-supabase");
          return;
        }
        setRows(
          (json.collections as Collection[]).map((c) => ({
            ...EMPTY,
            ...c,
            subtitle: c.subtitle ?? {},
            description: c.description ?? {},
            seo_title: c.seo_title ?? {},
            seo_description: c.seo_description ?? {},
          })),
        );
        setIllustrations(json.illustrations ?? []);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function keyOf(row: Collection, index: number) {
    return row.id ?? `new-${index}`;
  }

  function patchRow(index: number, patch: Partial<Collection>) {
    setRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  async function save(row: Collection, index: number) {
    const key = keyOf(row, index);
    setBusyKey(key);
    setErrorKey(null);
    const payload = { ...row, sort_order: Number(row.sort_order) || 0 };
    const res = await fetch("/api/admin/collections", {
      method: row.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    setBusyKey(null);
    if (!res || !res.ok) {
      let msg = t.saveError;
      if (res) {
        const json = await res.json().catch(() => null);
        if (json?.error === "slug-taken") msg = t.slugTaken;
        if (json?.error === "name-required") msg = t.nameRequired;
      }
      setErrorKey({ key, msg });
      return;
    }
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2500);
    await load();
  }

  async function remove(row: Collection, index: number) {
    if (!row.id) {
      setRows((rows) => rows.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm(t.confirmDelete.replace("{name}", row.name))) return;
    const key = keyOf(row, index);
    setBusyKey(key);
    const res = await fetch("/api/admin/collections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    }).catch(() => null);
    setBusyKey(null);
    if (!res || !res.ok) {
      setErrorKey({ key, msg: t.saveError });
      return;
    }
    await load();
  }

  if (state === "loading") {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }
  if (state === "no-supabase") {
    return (
      <p className="paper-panel rounded-2xl p-8 text-center text-sm leading-relaxed">
        {dict.admin.needsService}
      </p>
    );
  }
  if (state === "error") {
    return <p className="text-sm text-rose-deep">{dict.admin.loadError}</p>;
  }

  const input =
    "w-full rounded-xl border border-rose/20 bg-ivory/80 px-3 py-2 text-sm focus:border-rose";
  const label = "mb-1 block text-xs font-semibold text-rose-ink/70";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-rose-ink/80">{t.help}</p>
        <button
          type="button"
          onClick={() => setRows((rows) => [{ ...EMPTY }, ...rows])}
          className="btn-rose px-5 py-2.5 text-sm font-semibold"
        >
          + {t.add}
        </button>
      </div>

      <ul className="space-y-6">
        {rows.map((row, index) => {
          const key = keyOf(row, index);
          const busy = busyKey === key;
          return (
            <li key={key} className="stitched rounded-[1.8rem] p-6">
              <div className="relative z-10">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="block h-12 w-12 overflow-hidden rounded-full border border-rose/20"
                      style={{ backgroundColor: row.tint_color ?? "#faf0d8" }}
                    >
                      {row.cover_illustration_slug && (
                        <Image
                          src={`/illustrations/${row.cover_illustration_slug}/thumb.webp`}
                          alt=""
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-rose">
                        {row.name || t.untitled}
                      </p>
                      <p className="text-xs text-rose-ink/60">
                        /collections/{row.slug || "…"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(row, index)}
                    disabled={busy}
                    className="rounded-full border border-rose-deep/40 px-4 py-2 text-xs font-semibold text-rose-deep transition-colors hover:bg-rose-whisper disabled:opacity-50"
                  >
                    {t.delete}
                  </button>
                </div>

                {/* identity */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={label} htmlFor={`${key}-name`}>
                      {t.name}
                    </label>
                    <input
                      id={`${key}-name`}
                      className={input}
                      value={row.name}
                      onChange={(e) => patchRow(index, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`${key}-slug`}>
                      {t.slug}
                    </label>
                    <input
                      id={`${key}-slug`}
                      className={input}
                      value={row.slug}
                      placeholder={t.slugAuto}
                      onChange={(e) => patchRow(index, { slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`${key}-order`}>
                      {t.sortOrder}
                    </label>
                    <input
                      id={`${key}-order`}
                      type="number"
                      className={input}
                      value={row.sort_order}
                      onChange={(e) =>
                        patchRow(index, { sort_order: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={label} htmlFor={`${key}-tint`}>
                        {t.tint}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`${key}-tint`}
                          type="color"
                          value={row.tint_color ?? "#faf0d8"}
                          onChange={(e) =>
                            patchRow(index, { tint_color: e.target.value })
                          }
                          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-rose/20 bg-transparent"
                        />
                        <input
                          aria-label={t.tint}
                          className={input}
                          value={row.tint_color ?? ""}
                          onChange={(e) =>
                            patchRow(index, { tint_color: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className={label} htmlFor={`${key}-accent`}>
                        {t.accent}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`${key}-accent`}
                          type="color"
                          value={row.accent_color ?? "#c98781"}
                          onChange={(e) =>
                            patchRow(index, { accent_color: e.target.value })
                          }
                          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-rose/20 bg-transparent"
                        />
                        <input
                          aria-label={t.accent}
                          className={input}
                          value={row.accent_color ?? ""}
                          onChange={(e) =>
                            patchRow(index, { accent_color: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* copy FR/EN */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor={`${key}-sub-fr`}>
                      {t.subtitle} (FR)
                    </label>
                    <input
                      id={`${key}-sub-fr`}
                      className={input}
                      value={row.subtitle.fr ?? ""}
                      onChange={(e) =>
                        patchRow(index, {
                          subtitle: { ...row.subtitle, fr: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`${key}-sub-en`}>
                      {t.subtitle} (EN)
                    </label>
                    <input
                      id={`${key}-sub-en`}
                      className={input}
                      value={row.subtitle.en ?? ""}
                      onChange={(e) =>
                        patchRow(index, {
                          subtitle: { ...row.subtitle, en: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`${key}-desc-fr`}>
                      {t.description} (FR)
                    </label>
                    <textarea
                      id={`${key}-desc-fr`}
                      rows={3}
                      className={input}
                      value={row.description.fr ?? ""}
                      onChange={(e) =>
                        patchRow(index, {
                          description: { ...row.description, fr: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`${key}-desc-en`}>
                      {t.description} (EN)
                    </label>
                    <textarea
                      id={`${key}-desc-en`}
                      rows={3}
                      className={input}
                      value={row.description.en ?? ""}
                      onChange={(e) =>
                        patchRow(index, {
                          description: { ...row.description, en: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                {/* cover picker */}
                <div className="mt-4">
                  <p className={label}>{t.cover}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      type="button"
                      onClick={() =>
                        patchRow(index, { cover_illustration_slug: null })
                      }
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-xs ${
                        !row.cover_illustration_slug
                          ? "border-rose bg-rose-whisper font-semibold text-rose"
                          : "border-rose/20 text-rose-ink/50"
                      }`}
                    >
                      {t.noCover}
                    </button>
                    {illustrations.map((ill) => {
                      const selected =
                        row.cover_illustration_slug === ill.slug;
                      return (
                        <button
                          key={ill.slug}
                          type="button"
                          title={ill.title?.fr ?? ill.slug}
                          onClick={() =>
                            patchRow(index, {
                              cover_illustration_slug: ill.slug,
                            })
                          }
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-transform ${
                            selected
                              ? "border-rose shadow-md"
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={`/illustrations/${ill.slug}/thumb.webp`}
                            alt={ill.title?.fr ?? ill.slug}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SEO */}
                <details className="mt-4 rounded-2xl border border-rose/15 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-rose-ink">
                    {t.seo}
                  </summary>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor={`${key}-seot-fr`}>
                        {t.seoTitle} (FR)
                      </label>
                      <input
                        id={`${key}-seot-fr`}
                        className={input}
                        value={row.seo_title.fr ?? ""}
                        onChange={(e) =>
                          patchRow(index, {
                            seo_title: { ...row.seo_title, fr: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`${key}-seot-en`}>
                        {t.seoTitle} (EN)
                      </label>
                      <input
                        id={`${key}-seot-en`}
                        className={input}
                        value={row.seo_title.en ?? ""}
                        onChange={(e) =>
                          patchRow(index, {
                            seo_title: { ...row.seo_title, en: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`${key}-seod-fr`}>
                        {t.seoDescription} (FR)
                      </label>
                      <textarea
                        id={`${key}-seod-fr`}
                        rows={2}
                        className={input}
                        value={row.seo_description.fr ?? ""}
                        onChange={(e) =>
                          patchRow(index, {
                            seo_description: {
                              ...row.seo_description,
                              fr: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`${key}-seod-en`}>
                        {t.seoDescription} (EN)
                      </label>
                      <textarea
                        id={`${key}-seod-en`}
                        rows={2}
                        className={input}
                        value={row.seo_description.en ?? ""}
                        onChange={(e) =>
                          patchRow(index, {
                            seo_description: {
                              ...row.seo_description,
                              en: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </details>

                {/* actions */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => save(row, index)}
                    disabled={busy || !row.name.trim()}
                    className="btn-honey px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {busy
                      ? dict.common.loading
                      : row.id
                        ? t.save
                        : t.create}
                  </button>
                  {savedKey === key && (
                    <span className="text-sm font-semibold text-[#4c6a3f]">
                      ✓ {dict.admin.saved}
                    </span>
                  )}
                  {errorKey?.key === key && (
                    <span className="text-sm font-semibold text-rose-deep">
                      {errorKey.msg}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && (
        <p className="paper-panel mt-4 rounded-2xl p-8 text-center text-sm">
          {t.empty}
        </p>
      )}
    </div>
  );
}
