"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type GuardState =
  | "loading"
  | "no-supabase"
  | "signed-out"
  | "not-admin"
  | "admin";

/**
 * Client-side guard + chrome for the admin area.
 * UX only: actual protection lives in the RLS policies — every read and
 * write below this shell goes through `public.is_admin()` checks in
 * Postgres, so a bypassed guard still cannot see or change anything.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const [state, setState] = useState<GuardState>(
    supabase ? "loading" : "no-supabase",
  );
  const [, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        setState("signed-out");
        return;
      }
      setUser(data.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();
      if (cancelled) return;
      setState(profile?.is_admin ? "admin" : "not-admin");
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const notice = (text: string, showSignIn = false) => (
    <div className="mx-auto mt-10 max-w-xl rounded-[2rem] bg-honey-whisper p-10 text-center">
      <p className="text-sm leading-relaxed [overflow-wrap:anywhere]">{text}</p>
      {showSignIn && (
        <Link
          href={`/${locale}/connexion`}
          className="btn-rose mt-6 inline-block px-6 py-3 text-sm font-semibold"
        >
          {dict.auth.signIn}
        </Link>
      )}
    </div>
  );

  const tabs = [
    { href: `/${locale}/admin`, label: dict.admin.dashboard, exact: true },
    { href: `/${locale}/admin/illustrations`, label: dict.admin.illustrations },
    { href: `/${locale}/admin/commandes`, label: dict.admin.orders },
    { href: `/${locale}/admin/messages`, label: dict.admin.messages },
    { href: `/${locale}/admin/newsletter`, label: dict.admin.newsletter },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
      <header>
        <h1 className="text-4xl font-semibold text-rose">
          🐝 {dict.admin.title}
        </h1>
        <p className="mt-1 text-sm text-rose-ink/70">{dict.admin.subtitle}</p>
      </header>

      {state === "loading" && (
        <p className="mt-10 text-rose-ink/60">{dict.common.loading}</p>
      )}
      {state === "no-supabase" && notice(dict.admin.needsSupabase)}
      {state === "signed-out" && notice(dict.admin.signInFirst, true)}
      {state === "not-admin" && notice(dict.admin.notAdmin)}

      {state === "admin" && (
        <>
          <nav aria-label={dict.admin.title} className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const active = tab.exact
                  ? pathname === tab.href
                  : pathname.startsWith(tab.href);
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-block rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-rose text-ivory shadow-sm"
                          : "border border-rose/25 text-rose-ink hover:border-rose hover:bg-ivory/70"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-8">{children}</div>
        </>
      )}
    </div>
  );
}
