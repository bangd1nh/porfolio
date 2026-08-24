import { hasLocale } from "next-intl"
import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

import { routing } from "./i18n/routing"

/**
 * Cookie-only locale: honor NEXT_LOCALE when present, otherwise default `vi`.
 * Skip Accept-Language so Googlebot still gets Vietnamese at `/`.
 */
export default function proxy(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  const hasLocaleCookie = hasLocale(routing.locales, cookieLocale)

  return createMiddleware({
    ...routing,
    localeDetection: hasLocaleCookie,
    alternateLinks: false,
  })(request)
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
