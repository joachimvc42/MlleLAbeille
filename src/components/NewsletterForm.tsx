"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const { dict, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="rounded-2xl bg-sage-soft px-4 py-3 text-sm">
        {dict.home.newsletterSuccess}
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`flex ${compact ? "flex-col gap-2" : "flex-col gap-3 sm:flex-row"}`}
    >
      <label className="sr-only" htmlFor={`newsletter-email-${compact}`}>
        {dict.home.newsletterPlaceholder}
      </label>
      <input
        id={`newsletter-email-${compact}`}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.home.newsletterPlaceholder}
        className="w-full rounded-full border border-[#4A5033]/20 bg-ivory px-5 py-3 text-sm text-[#4A5033] placeholder:text-[#4A5033] focus:border-[#4A5033]"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-sage shrink-0 px-6 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {state === "sending" ? "…" : dict.home.newsletterCta}
      </button>
      {state === "error" && (
        <p role="alert" className="text-sm text-rose-deep">
          {dict.common.error}
        </p>
      )}
    </form>
  );
}
