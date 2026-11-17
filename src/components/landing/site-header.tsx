import Link from "next/link";

import { LogoMark, WhatsappIcon } from "@/components/icons";
import { localeNames, localePath, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getSite } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

import { HeaderShell } from "./header-shell";
import { MobileMenu } from "./mobile-menu";

type SiteHeaderProps = {
  /** The current page's path without the locale, e.g. "/tours", so the switcher can link to it in other languages. */
  path: string;
  /**
   * The page opens with a full-bleed photo (the home page). From 640px the bar then floats over it,
   * transparent with white text, and turns white once the page scrolls. Phones keep the plain white bar.
   */
  overPhoto?: boolean;
};

// Logo, navigation, then language and WhatsApp on the right. Phones: a flat full-width bar that stays at the top
// while scrolling. From 640px: a floating white bar with soft corners.
export async function SiteHeader({ path, overPhoto = false }: SiteHeaderProps) {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.header;
  const site = await getSite();

  const navLinks = [
    { path: "/tours", label: t.nav.tours },
    { path: "/transfer", label: t.nav.transfers },
    { path: "/plan-your-visit", label: t.nav.plan },
    { path: "/how-to-book", label: t.nav.booking },
    { path: "/faq", label: t.nav.faq },
  ].map((link) => ({
    ...link,
    href: localePath(locale, link.path),
    // Tour detail pages count as being inside "Tours"
    current: path === link.path || path.startsWith(`${link.path}/`),
  }));

  return (
    <HeaderShell
      overPhoto={overPhoto}
      className={`sticky top-0 z-30 text-ink sm:px-3 sm:pt-3 ${overPhoto ? "sm:fixed sm:inset-x-0 sm:top-0" : "sm:relative"}`}
    >
      <div
        className={`mx-auto flex h-14 max-w-[90rem] items-stretch bg-white shadow-[0_1px_0_rgb(0_0_0/0.06)] sm:rounded-2xl sm:border sm:border-ink/10 transition-[background-color,border-color,color,box-shadow] duration-300 lg:h-16 sm:group-data-photo/header:border-transparent sm:group-data-photo/header:bg-transparent sm:group-data-photo/header:text-white ${
          overPhoto ? "sm:shadow-[0_12px_30px_-18px_rgb(0_0_0/0.35)] sm:group-data-photo/header:shadow-none" : "sm:shadow-none"
        }`}
      >
        <Link
          href={localePath(locale)}
          className="flex shrink-0 items-center gap-2 px-4 text-[1.15rem] font-medium tracking-[-0.03em] sm:px-6"
        >
          <LogoMark className="size-6 text-brand" />
          {site.businessName.toLowerCase()}
        </Link>

        <nav aria-label={t.menu} className="hidden flex-1 items-center justify-center px-4 lg:flex">
          <ul className="flex gap-x-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 text-[0.95rem] whitespace-nowrap text-ink/75 hover:bg-cream hover:text-ink aria-[current=page]:bg-cream aria-[current=page]:text-ink sm:group-data-photo/header:text-white/90 sm:group-data-photo/header:hover:bg-white/15 sm:group-data-photo/header:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 pr-2">
          <details className="relative hidden lg:block">
            <summary
              aria-label={t.language}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.95rem] uppercase hover:bg-cream sm:group-data-photo/header:hover:bg-white/15"
            >
              {locale}
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </summary>
            <ul className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-ink/10 bg-white p-1.5 text-ink shadow-xl shadow-ink/10">
              {locales.map((option) => (
                <li key={option}>
                  <Link
                    href={localePath(option, path)}
                    hrefLang={option}
                    lang={option}
                    aria-current={option === locale ? "true" : undefined}
                    className="flex justify-between rounded-xl px-3 py-2.5 hover:bg-cream aria-[current]:font-medium"
                  >
                    {localeNames[option]}
                    {option === locale ? <span aria-hidden="true">✓</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          <a
            href={whatsappLink(site, t.chatMessage)}
            className="pill hidden bg-ink px-4 py-2.5 text-[0.9rem] text-white hover:bg-ink/85 sm:inline-flex sm:group-data-photo/header:bg-white sm:group-data-photo/header:text-ink sm:group-data-photo/header:hover:bg-white/85"
          >
            <WhatsappIcon className="size-[1.1rem]" />
            {t.chat}
          </a>

          {/* Phones and tablets: the links and the language fold into a bottom-sheet menu */}
          <MobileMenu
            links={navLinks}
            languages={locales.map((option) => ({
              href: localePath(option, path),
              name: localeNames[option],
              lang: option,
              current: option === locale,
            }))}
            whatsappHref={whatsappLink(site, t.chatMessage)}
            text={{ menu: t.menu, language: t.language, chat: t.chat, back: dict.search.back }}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
