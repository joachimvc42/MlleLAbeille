"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { adminDb } from "@/lib/adminFetch";
import { formatPrice } from "@/lib/catalogue/types";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

interface Row {
  id: string;
  ref: string;
  email: string;
  status: string;
  total_cents: number;
  payment_provider: string | null;
  fulfillment_provider: string | null;
  created_at: string;
}

export function AdminOrders() {
  const { locale, dict } = useI18n();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const [noService, setNoService] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    adminDb<Row>({
      table: "orders",
      action: "select",
      columns: [
        "id",
        "ref",
        "email",
        "status",
        "total_cents",
        "payment_provider",
        "fulfillment_provider",
        "created_at",
      ],
      order: [{ column: "created_at", ascending: false }],
      limit: 200,
    }).then((res) => {
      if (!res.ok) {
        if (res.error === "no-admin-client") setNoService(true);
        else setError(true);
      } else setRows(res.rows ?? []);
    });
  }, []);

  async function setStatus(id: string, status: string) {
    if (!rows) return;
    setSavingId(id);
    const res = await adminDb({
      table: "orders",
      action: "update",
      id,
      patch: { status },
    });
    if (res.ok) {
      setRows(rows.map((r) => (r.id === id ? { ...r, status } : r)));
    }
    setSavingId(null);
  }

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
  if (!rows) {
    return <p className="text-rose-ink/60">{dict.common.loading}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="paper-panel rounded-2xl p-8 text-center text-sm">
        {dict.admin.noOrders}
      </p>
    );
  }

  const statusLabel = (status: string) =>
    dict.account.statuses[status as keyof typeof dict.account.statuses] ??
    status;

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-rose-ink/80">
        {dict.admin.ordersHelp}
      </p>
      <div className="overflow-x-auto paper-panel rounded-[1.6rem] p-4">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-rose/15 text-xs uppercase tracking-wide text-rose/70">
              <th className="py-2 pr-4">{dict.checkout.orderRef}</th>
              <th className="py-2 pr-4">{dict.checkout.email}</th>
              <th className="py-2 pr-4">{dict.account.orderDate}</th>
              <th className="py-2 pr-4">{dict.account.orderStatus}</th>
              <th className="py-2 pr-4 text-right">{dict.account.orderTotal}</th>
              <th className="py-2">Stripe / Printify</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-rose/10">
                <td className="py-2.5 pr-4 font-mono text-xs">{row.ref}</td>
                <td className="max-w-[180px] truncate py-2.5 pr-4">
                  {row.email}
                </td>
                <td className="py-2.5 pr-4">
                  {new Date(row.created_at).toLocaleDateString(
                    locale === "fr" ? "fr-FR" : "en-GB",
                  )}
                </td>
                <td className="py-2.5 pr-4">
                  <select
                    value={row.status}
                    disabled={savingId === row.id}
                    onChange={(e) => setStatus(row.id, e.target.value)}
                    aria-label={`${dict.account.orderStatus} ${row.ref}`}
                    className="rounded-xl border border-rose/20 bg-ivory px-2 py-1.5 text-xs font-semibold"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5 pr-4 text-right font-semibold">
                  {formatPrice(row.total_cents, locale)}
                </td>
                <td className="py-2.5 text-xs text-rose-ink/60">
                  {row.payment_provider ?? "—"} /{" "}
                  {row.fulfillment_provider ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
