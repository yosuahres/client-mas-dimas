"use client";

import { useEffect, useState, type ReactNode } from "react";

type HeaderShellProps = {
  /** The page starts with a full-bleed photo that runs up behind the header (the home page). */
  overPhoto: boolean;
  className: string;
  children: ReactNode;
};

// How far the page scrolls before the bar turns white
const SCROLL_THRESHOLD = 24;

// The <header> element. Over a photo it carries data-photo while the page is at the top, so the bar can be
// transparent with white text there (the "group-data-photo/header" classes in SiteHeader) and turn white on scroll.
export function HeaderShell({ overPhoto, className, children }: HeaderShellProps) {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (!overPhoto) return;
    const update = () => setAtTop(window.scrollY < SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [overPhoto]);

  return (
    <header data-photo={overPhoto && atTop ? "" : undefined} className={`group/header ${className}`}>
      {children}
    </header>
  );
}
