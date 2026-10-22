import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/checkout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const locale = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (locale) {
    const rest = pathname.slice(locale.length + 1) || "/";
    const isProtected = PROTECTED_PREFIXES.some(
      (p) => rest === p || rest.startsWith(`${p}/`)
    );
    if (isProtected && !hasSession) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
