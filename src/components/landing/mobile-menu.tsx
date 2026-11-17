"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { ArrowLeftIcon, WhatsappIcon } from "@/components/icons";

type MenuLink = { href: string; label: string; current: boolean };
type LanguageLink = { href: string; name: string; current: boolean; lang: string };

type MobileMenuProps = {
  links: MenuLink[];
  languages: LanguageLink[];
  whatsappHref: string;
  text: { menu: string; language: string; chat: string; back: string };
};

const FOCUSABLE = 'a[href], button:not([disabled])';

// Phones and tablets: the ☰ button opens a bottom sheet like the tiket.com app's menu: the pages as rows,
// a Language row that opens the language list in the same sheet, and WhatsApp at the bottom.
export function MobileMenu({ links, languages, whatsappHref, text }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "language">("menu");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const currentLanguage = languages.find((language) => language.current);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  // Keep the page still behind the sheet
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Start keyboard focus inside the sheet, and again when switching between the menu and the language list
  useEffect(() => {
    if (open) sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
  }, [open, view]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const rowClass = "flex w-full items-center justify-between gap-4 py-4 text-left text-[1.05rem]";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={text.menu}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setView("menu");
          setOpen(true);
        }}
        className="grid size-10 place-items-center rounded-full hover:bg-cream sm:group-data-photo/header:hover:bg-white/15 lg:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
          <path d="M3 7h18M3 12h18M3 17h18" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
              <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-black/40 motion-safe:animate-appear" />
              <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onKeyDown={handleKeyDown}
                className="relative max-h-[88svh] overflow-y-auto rounded-t-3xl bg-white px-6 pt-2.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink motion-safe:animate-sheet"
              >
                <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-ink/15" />

                {view === "menu" ? (
                  <>
                    <h2 id={titleId} className="mt-5 text-xl font-medium">
                      {text.menu}
                    </h2>
                    <ul className="mt-2">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            aria-current={link.current ? "page" : undefined}
                            className={`${rowClass} aria-[current=page]:font-medium aria-[current=page]:text-jade`}
                          >
                            {link.label}
                            <Chevron />
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button type="button" onClick={() => setView("language")} className={rowClass}>
                          {text.language}
                          <span className="flex items-center gap-2 text-[0.95rem] text-ink-muted">
                            {currentLanguage?.name}
                            <Chevron />
                          </span>
                        </button>
                      </li>
                    </ul>
                    <a href={whatsappHref} className="pill mt-5 w-full bg-jade py-4 text-white hover:bg-jade/90">
                      <WhatsappIcon className="size-[1.1rem]" />
                      {text.chat}
                    </a>
                  </>
                ) : (
                  <>
                    <div className="mt-3 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setView("menu")}
                        aria-label={text.back}
                        className="-ml-2.5 grid size-10 place-items-center rounded-full hover:bg-cream"
                      >
                        <ArrowLeftIcon className="size-5" />
                      </button>
                      <h2 id={titleId} className="text-xl font-medium">
                        {text.language}
                      </h2>
                    </div>
                    <ul className="mt-2">
                      {languages.map((language) => (
                        <li key={language.href}>
                          <Link
                            href={language.href}
                            hrefLang={language.lang}
                            lang={language.lang}
                            onClick={() => setOpen(false)}
                            aria-current={language.current ? "true" : undefined}
                            className={`${rowClass} aria-[current]:font-medium`}
                          >
                            {language.name}
                            {language.current ? (
                              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-5 text-jade">
                                <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                              </svg>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-5 shrink-0 text-ink">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
