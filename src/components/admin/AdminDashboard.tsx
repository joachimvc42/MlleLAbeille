"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { adminDb } from "@/lib/adminFetch";

interface Stats {
  published: number;
  drafts: number;
  orders: number;
  pendingOrders: number;
  subscribers: number;
  unreadMessages: number;
}

export function AdminDashboard() {
  const { dict } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [noService, setNoService] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const count = (
        table: string,
        filters?: { column: string; op: "eq" | "in"; value: unknown }[],
      ) => adminDb({ table, action: "count", filters });

      const results = await Promise.all([
        count("illustrations", [{ column: "status", op: "eq", value: "published" }]),
        count("illustrations", [{ column: "status", op: "eq", value: "draft" }]),
        count("orders"),
        count("orders", [{ column: "status", op: "in", value: ["pending", "paid"] }]),
        count("newsletter_subscribers"),
        count("contact_messages", [{ column: "handled", op: "eq", value: false }]),
      ]);
      if (cancelled) return;
      const failed = results.find((r) => !r.ok);
      if (failed && !failed.ok) {
        if (failed.error === "no-admin-client") setNoService(true);
        else setError(true);
        return;
      }
      const [published, drafts, orders, pending, subscribers, unread] = results;
      const n = (r: (typeof results)[number]) => (r.ok ? (r.count ?? 0) : 0);
      setStats({
        published: n(published),
        drafts: n(drafts),
        orders: n(orders),
        pendingOrders: n(pending),
        subscribers: n(subscribers),
        unreadMessages: n(unread),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (noService) {
    return (
      <p className="paper-panel rounded-2xl p-8 text-center text-sm leading-relaxed">
        {dict.admin.needsService}
      </p>
    );
  }
  if (error) {
    return <p className="text-sm text-rose-deep">{dict.admin.loadError}</p>;
  }
  if (!stats) {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }

  const tiles: { label: string; value: number; accent?: boolean }[] = [
    { label: dict.admin.stats.published, value: stats.published },
    { label: dict.admin.stats.drafts, value: stats.drafts },
    { label: dict.admin.stats.orders, value: stats.orders },
    {
      label: dict.admin.stats.pendingOrders,
      value: stats.pendingOrders,
      accent: stats.pendingOrders > 0,
    },
    { label: dict.admin.stats.subscribers, value: stats.subscribers },
    {
      label: dict.admin.stats.unreadMessages,
      value: stats.unreadMessages,
      accent: stats.unreadMessages > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`stitched rounded-[1.6rem] p-6 ${
            tile.accent ? "bg-honey-whisper" : ""
          }`}
        >
          <p className="font-display relative z-10 text-4xl font-semibold text-rose">
            {tile.value}
          </p>
          <p className="relative z-10 mt-1 text-sm text-rose-ink/80">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}
