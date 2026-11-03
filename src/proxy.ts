import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { supabaseConfig } from "@/lib/supabase/config";

const LOCALE_COOKIE = "locale";

// Picks the first supported language from the browser's Accept-Language header, e.g. "fr-FR,fr;q=0.9,en;q=0.8".
function preferredLocale(acceptLanguage: string | null): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      return { language: tag.split("-")[0].toLowerCase(), weight: quality ? Number(quality) : 1 };
    })
    .sort((a, b) => b.weight - a.weight);
  const match = ranked.map(({ language }) => language).find(hasLocale);
  return match ?? defaultLocale;
}

const ADMIN_LOGIN = "/admin/login";

// Keeps the admin's Supabase session fresh and sends signed-out visitors to the login page.
// Pages and server actions still check the session themselves; this is only the front door.
async function adminProxy(request: NextRequest) {
  const config = supabaseConfig();
  // Without Supabase, /admin shows the setup steps.
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const onLoginPage = request.nextUrl.pathname === ADMIN_LOGIN;
  if (!user && !onLoginPage) {
    const login = request.nextUrl.clone();
    login.pathname = ADMIN_LOGIN;
    login.search = "";
    return NextResponse.redirect(login);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminProxy(request);

  const pathLocale = locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  // Remember an explicit language choice, so "/" sends the visitor back to it next time.
  if (pathLocale) {
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== pathLocale) {
      response.cookies.set(LOCALE_COOKIE, pathLocale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return response;
  }

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = saved && hasLocale(saved) ? saved : preferredLocale(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next.js internals and files with an extension (images, favicon, etc.).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
