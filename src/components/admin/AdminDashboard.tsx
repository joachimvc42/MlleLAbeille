"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const supabase = getSupabaseBrowserClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const query = (t: string) =>
        supabase.from(t).select("*", { count: "exact", head: true });
      type Q = ReturnType<typeof query>;

      try {
        const [published, drafts, orders, pending, subscribers, unread] =
          await Promise.all([
            query("illustrations").eq("status", "published") as Q,
            query("illustrations").eq("status", "draft") as Q,
            query("orders") as Q,
            query("orders").in("status", ["pending", "paid"]) as Q,
            query("newsletter_subscribers") as Q,
            query("contact_messages").eq("handled", false) as Q,
          ]);
        if (cancelled) return;
        setStats({
          published: published.count ?? 0,
          drafts: drafts.count ?? 0,
          orders: orders.count ?? 0,
          pendingOrders: pending.count ?? 0,
          subscribers: subscribers.count ?? 0,
          unreadMessages: unread.count ?? 0,
        });
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

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
