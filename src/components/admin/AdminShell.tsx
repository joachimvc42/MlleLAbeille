"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Chrome of the admin area. Access control happens server-side: the admin
 * layout only renders this shell when the password session cookie is
 * valid, and every /api/admin/* route re-checks that cookie before
 * touching the database with the service-role client.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  const tabs = [
    { href: `/${locale}/admin`, label: dict.admin.dashboard, exact: true },
    { href: `/${locale}/admin/collections`, label: dict.admin.collections },
    { href: `/${locale}/admin/illustrations`, label: dict.admin.illustrations },
    { href: `/${locale}/admin/commandes`, label: dict.admin.orders },
    { href: `/${locale}/admin/messages`, label: dict.admin.messages },
    { href: `/${locale}/admin/newsletter`, label: dict.admin.newsletter },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-rose">
            🐝 {dict.admin.title}
          </h1>
          <p className="mt-1 text-sm text-rose-ink/70">{dict.admin.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          {dict.admin.logout}
        </button>
      </header>

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
    </div>
  );
}
