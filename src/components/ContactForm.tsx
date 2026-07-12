"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function ContactForm() {
  const { dict, locale } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");

    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          locale,
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="relative z-10 rounded-2xl bg-sage-soft p-6 text-center">
        {dict.contact.success}
      </p>
    );
  }

  const input =
    "w-full rounded-2xl border border-rose/20 bg-ivory px-4 py-3 text-sm placeholder:text-rose-ink/40 focus:border-rose";

  return (
    <form onSubmit={submit} className="relative z-10 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-sm font-semibold">
            {dict.contact.name}
          </label>
          <input id="contact-name" name="name" required maxLength={80} className={input} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-semibold">
            {dict.contact.email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={160}
            className={input}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-semibold">
          {dict.contact.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={5}
          maxLength={4000}
          className={input}
        />
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm font-semibold text-rose-deep">
          {dict.common.error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-rose px-8 py-3.5 font-semibold disabled:opacity-60"
      >
        {state === "sending" ? "…" : dict.contact.send}
      </button>
    </form>
  );
}
