import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "./lib/auth";
import { DEFAULT_LOCALE, LOCALES } from "./lib/i18n";

const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

function requireAdminSession(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

/**
 * Two jobs, in order:
 *
 *  1. /admin/** stays behind the session cookie (unchanged).
 *  2. Locale routing. Every public page lives at `app/(site)/[lang]/…`, but English keeps the
 *     bare URLs it was indexed under: /about is *rewritten* onto /en/about, so the URL the
 *     visitor and Google see never changes. /id/about is served as-is. /en/about — which only
 *     a crawler following a stray link would ask for — permanently redirects to /about so the
 *     same page can't be indexed twice.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return requireAdminSession(request);
  }

  // /en/x -> /x (one canonical URL per page)
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const stripped = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url, 308);
  }

  // /id/x already names its locale segment — nothing to do.
  if (NON_DEFAULT_LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next internals, and any path with a file extension
  // (/robots.txt, /sitemap.xml, /icon-istudentplus.png and friends serve themselves).
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
