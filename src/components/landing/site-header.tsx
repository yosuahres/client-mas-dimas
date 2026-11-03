import Link from "next/link";

import { LogoMark, WhatsappIcon } from "@/components/icons";
import { localeNames, localePath, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getSite } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

type SiteHeaderProps = {
  /** The current page's path without the locale, e.g. "/tours", so the switcher can link to it in other languages. */
  path: string;
};

// A floating white bar with soft corners: logo, navigation, then language and WhatsApp on the right.
export async function SiteHeader({ path }: SiteHeaderProps) {
  const locale = await getLocale();
  const t = (await getDictionary()).header;
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
    <header className="relative z-30 px-3 pt-3 text-ink">
      <div className="mx-auto flex h-14 max-w-[90rem] items-stretch rounded-2xl border border-ink/10 bg-white lg:h-16">
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
                  className="rounded-full px-3.5 py-2 text-[0.95rem] whitespace-nowrap text-ink/75 hover:bg-cream hover:text-ink aria-[current=page]:bg-cream aria-[current=page]:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 pr-2">
          <details className="relative">
            <summary
              aria-label={t.language}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.95rem] uppercase hover:bg-cream"
            >
              {locale}
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </summary>
            <ul className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-ink/10 bg-white p-1.5 shadow-xl shadow-ink/10">
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
            className="pill hidden bg-ink px-4 py-2.5 text-[0.9rem] text-white hover:bg-ink/85 sm:inline-flex"
          >
            <WhatsappIcon className="size-[1.1rem]" />
            {t.chat}
          </a>

          {/* Phones and tablets: the links fold into a menu */}
          <details className="lg:hidden">
            <summary aria-label={t.menu} className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-cream">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
                <path d="M3 7h18M3 12h18M3 17h18" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </summary>
            <nav aria-label={t.menu} className="absolute inset-x-3 top-full mt-2 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl shadow-ink/10">
              <ul>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={link.current ? "page" : undefined}
                      className="block rounded-xl px-4 py-3 text-lg hover:bg-cream aria-[current=page]:bg-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
