import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

const LOCALE_COOKIE = "MLLE_LOCALE";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) {
    return cookie;
  }

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const lang = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (lang && (locales as readonly string[]).includes(lang)) {
      return lang;
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes and static files.
    "/((?!api|_next|illustrations|sounds|.*\\..*).*)",
  ],
};
