"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/catalogue/types";

interface OrderRow {
  id: string;
  ref: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
}

interface AddressRow {
  id: string;
  label: string | null;
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  postal_code: string;
  city: string;
  country: string;
}

export function AccountView() {
  const { locale, dict } = useI18n();
  const supabase = getSupabaseBrowserClient();

  const [user, setUser] = useState<User | null>(null);
  // Only load when Supabase exists; otherwise render the notice immediately.
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [displayName, setDisplayName] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [savedProfile, setSavedProfile] = useState(false);

  const loadData = useCallback(
    async (uid: string) => {
      if (!supabase) return;
      const [profileRes, ordersRes, addressesRes] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle(),
        supabase
          .from("orders")
          .select("id, ref, status, total_cents, currency, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("addresses")
          .select(
            "id, label, first_name, last_name, address1, address2, postal_code, city, country",
          )
          .order("created_at", { ascending: false }),
      ]);
      setDisplayName(profileRes.data?.display_name ?? "");
      setOrders((ordersRes.data as OrderRow[] | null) ?? []);
      setAddresses((addressesRes.data as AddressRow[] | null) ?? []);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      setUser(data.user);
      if (data.user) await loadData(data.user.id);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, loadData]);

  if (!supabase) {
    return (
      <p className="mt-10 rounded-2xl bg-honey-whisper p-8 text-center text-sm">
        {dict.auth.notConfigured}
      </p>
    );
  }

  if (loading) {
    return <p className="mt-10 text-rose-ink/60">{dict.common.loading}</p>;
  }

  if (!user) {
    return (
      <div className="mt-10 rounded-[2rem] bg-ivory/70 p-12 text-center">
        <p className="text-lg">{dict.auth.signInTitle}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/connexion`}
            className="btn-rose px-7 py-3.5 font-semibold"
          >
            {dict.auth.signIn}
          </Link>
          <Link
            href={`/${locale}/inscription`}
            className="btn-ghost px-7 py-3.5 font-semibold"
          >
            {dict.auth.signUp}
          </Link>
        </div>
      </div>
    );
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !user) return;
    await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  }

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label: form.get("label") || null,
      first_name: form.get("firstName"),
      last_name: form.get("lastName"),
      address1: form.get("address1"),
      address2: form.get("address2") || null,
      postal_code: form.get("postalCode"),
      city: form.get("city"),
      country: form.get("country"),
    });
    if (!error) {
      event.currentTarget.reset();
      await loadData(user.id);
    }
  }

  async function removeAddress(id: string) {
    if (!supabase || !user) return;
    await supabase.from("addresses").delete().eq("id", id);
    await loadData(user.id);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  const input =
    "w-full rounded-2xl border border-rose/20 bg-ivory px-4 py-2.5 text-sm focus:border-rose";
  const statusLabel = (status: string) =>
    dict.account.statuses[status as keyof typeof dict.account.statuses] ??
    status;

  return (
    <div className="mt-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg">
          {dict.account.welcome},{" "}
          <span className="font-semibold text-rose">
            {displayName || user.email}
          </span>{" "}
          👋
        </p>
        <button
          type="button"
          onClick={signOut}
          className="btn-ghost px-5 py-2.5 text-sm font-semibold"
        >
          {dict.auth.signOut}
        </button>
      </div>

      {/* Profile */}
      <section aria-labelledby="account-profile" className="stitched rounded-[1.8rem] p-6">
        <h2 id="account-profile" className="font-display relative z-10 text-lg font-semibold text-rose">
          {dict.account.profile}
        </h2>
        <form onSubmit={saveProfile} className="relative z-10 mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="profile-name" className="mb-1 block text-sm font-semibold">
              {dict.account.displayName}
            </label>
            <input
              id="profile-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              className={input}
            />
          </div>
          <button type="submit" className="btn-rose px-6 py-2.5 text-sm font-semibold">
            {savedProfile ? "✓" : dict.common.save}
          </button>
        </form>
      </section>

      {/* Orders */}
      <section aria-labelledby="account-orders" className="stitched rounded-[1.8rem] p-6">
        <h2 id="account-orders" className="font-display relative z-10 text-lg font-semibold text-rose">
          {dict.account.orders}
        </h2>
        <div className="relative z-10 mt-4">
          {orders.length === 0 ? (
            <p className="text-sm text-rose-ink/70">{dict.account.noOrders}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-rose/15 text-xs uppercase tracking-wide text-rose/70">
                    <th className="py-2 pr-4">{dict.checkout.orderRef}</th>
                    <th className="py-2 pr-4">{dict.account.orderDate}</th>
                    <th className="py-2 pr-4">{dict.account.orderStatus}</th>
                    <th className="py-2 text-right">{dict.account.orderTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-rose/10">
                      <td className="py-2.5 pr-4 font-mono text-xs">{order.ref}</td>
                      <td className="py-2.5 pr-4">
                        {new Date(order.created_at).toLocaleDateString(
                          locale === "fr" ? "fr-FR" : "en-GB",
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="rounded-full bg-honey-whisper px-3 py-1 text-xs font-semibold">
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        {formatPrice(order.total_cents, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Addresses */}
      <section aria-labelledby="account-addresses" className="stitched rounded-[1.8rem] p-6">
        <h2 id="account-addresses" className="font-display relative z-10 text-lg font-semibold text-rose">
          {dict.account.addresses}
        </h2>
        <div className="relative z-10 mt-4 space-y-4">
          {addresses.length === 0 ? (
            <p className="text-sm text-rose-ink/70">{dict.account.noAddresses}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <li
                  key={address.id}
                  className="rounded-2xl bg-ivory/80 p-4 text-sm shadow-sm"
                >
                  {address.label && (
                    <p className="font-semibold text-rose">{address.label}</p>
                  )}
                  <p>
                    {address.first_name} {address.last_name}
                  </p>
                  <p>{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>
                    {address.postal_code} {address.city}, {address.country}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.id)}
                    className="mt-2 text-xs font-semibold text-rose-deep underline-offset-4 hover:underline"
                  >
                    {dict.common.remove}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <details className="rounded-2xl bg-ivory/60 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-rose">
              + {dict.account.addAddress}
            </summary>
            <form onSubmit={addAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input name="label" placeholder="🏠" aria-label="Label" maxLength={40} className={input} />
              <span className="hidden sm:block" />
              <input name="firstName" required placeholder={dict.checkout.firstName} aria-label={dict.checkout.firstName} className={input} />
              <input name="lastName" required placeholder={dict.checkout.lastName} aria-label={dict.checkout.lastName} className={input} />
              <input name="address1" required placeholder={dict.checkout.address1} aria-label={dict.checkout.address1} className={`${input} sm:col-span-2`} />
              <input name="address2" placeholder={dict.checkout.address2} aria-label={dict.checkout.address2} className={`${input} sm:col-span-2`} />
              <input name="postalCode" required placeholder={dict.checkout.postalCode} aria-label={dict.checkout.postalCode} className={input} />
              <input name="city" required placeholder={dict.checkout.city} aria-label={dict.checkout.city} className={input} />
              <input name="country" required placeholder="FR" maxLength={2} aria-label={dict.checkout.country} className={input} />
              <button type="submit" className="btn-rose px-6 py-2.5 text-sm font-semibold">
                {dict.common.save}
              </button>
            </form>
          </details>
        </div>
      </section>

      {/* Favorites link */}
      <p>
        <Link
          href={`/${locale}/favoris`}
          className="font-semibold text-rose underline-offset-4 hover:underline"
        >
          ♥ {dict.account.favorites}
        </Link>
      </p>
    </div>
  );
}
