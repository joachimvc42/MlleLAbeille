"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  if (!supabase) {
    return (
      <p className="relative z-10 rounded-2xl bg-honey-whisper p-6 text-center text-sm">
        {dict.auth.notConfigured}
      </p>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending" || !supabase) return;
    setState("sending");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setState("sent");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(`/${locale}/compte`);
        router.refresh();
      }
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="relative z-10 rounded-2xl bg-sage-soft p-6 text-center">
        {dict.auth.checkEmail}
      </p>
    );
  }

  const input =
    "w-full rounded-2xl border border-rose/20 bg-ivory px-4 py-3 text-sm focus:border-rose";

  return (
    <form onSubmit={submit} className="relative z-10 space-y-5">
      <div>
        <label htmlFor="auth-email" className="mb-1 block text-sm font-semibold">
          {dict.auth.email}
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={input}
        />
      </div>
      <div>
        <label htmlFor="auth-password" className="mb-1 block text-sm font-semibold">
          {dict.auth.password}
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={input}
        />
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm font-semibold text-rose-deep">
          {dict.auth.genericError}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-rose w-full px-8 py-3.5 font-semibold disabled:opacity-60"
      >
        {state === "sending"
          ? "…"
          : mode === "signup"
            ? dict.auth.signUp
            : dict.auth.signIn}
      </button>
      <p className="text-center text-sm">
        {mode === "signup" ? dict.auth.hasAccount : dict.auth.noAccount}{" "}
        <Link
          href={`/${locale}/${mode === "signup" ? "connexion" : "inscription"}`}
          className="font-semibold text-rose underline-offset-4 hover:underline"
        >
          {mode === "signup" ? dict.auth.signIn : dict.auth.signUp}
        </Link>
      </p>
    </form>
  );
}
