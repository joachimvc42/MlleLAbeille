"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { BeeLogo } from "@/components/BeeLogo";

/** Password door of the workshop. On success the server sets the
 *  HTTP-only session cookie and the admin layout re-renders its content. */
export function AdminLogin() {
  const { dict } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.refresh();
      return;
    }
    setFailed(true);
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <form
        onSubmit={submit}
        className="paper-panel rounded-[2rem] p-10 text-center"
      >
        <BeeLogo className="mx-auto h-16 w-16" />
        <h1 className="mt-4 text-3xl font-semibold text-rose">
          {dict.admin.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-rose-ink/75">{dict.admin.loginIntro}</p>
        <label htmlFor="admin-password" className="sr-only">
          {dict.admin.password}
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.admin.password}
          autoFocus
          className="mt-6 w-full rounded-full border border-rose/25 bg-ivory/90 px-5 py-3 text-center text-sm focus:border-rose"
        />
        {failed && (
          <p className="mt-3 text-sm font-semibold text-rose-deep">
            {dict.admin.loginError}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="btn-rose mt-6 w-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? dict.common.loading : dict.admin.loginButton}
        </button>
      </form>
    </div>
  );
}
