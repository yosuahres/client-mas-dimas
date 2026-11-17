import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, hasLocale, locales } from "@/i18n/config";
import { supabaseConfig } from "@/lib/supabase/config";

// Renamed from "locale" when Indonesian became the default, so languages remembered before then don't carry over.
const LOCALE_COOKIE = "lang";

const ADMIN_LOGIN = "/admin/login";

// Keeps the admin's Supabase session fresh and sends signed-out visitors to the login page.
// Pages and server actions still check the session themselves; this is only the front door.
async function adminProxy(request: NextRequest) {
  const config = supabaseConfig();
  // Without Supabase, /admin shows the setup steps.
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
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
  // getClaims refreshes an expired session like getUser, but checks the token's signature locally (the project signs
  // with asymmetric keys) instead of a round trip to the Auth server on every click. requireAdmin() still asks the
  // Auth server, so a removed admin is locked out straight away.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const onLoginPage = request.nextUrl.pathname === ADMIN_LOGIN;
  if (!signedIn && !onLoginPage) {
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
  // Indonesian first, whatever the browser's language; the menu's Language row switches and is remembered
  const locale = saved && hasLocale(saved) ? saved : defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next.js internals and files with an extension (images, favicon, etc.).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
