import type { Dictionary } from "@/i18n/dictionaries/en";

// The tabs of the Website text page: one per part of the site, in the order a visitor meets them.
export const textPages = [
  { key: "home", title: "Home page" },
  { key: "tours", title: "Tour packages" },
  { key: "transfers", title: "Airport & transfers" },
  { key: "info", title: "Info pages" },
  { key: "every", title: "Every page" },
  { key: "google", title: "Google" },
] as const;

export type TextPageKey = (typeof textPages)[number]["key"];

export type TextSection = { key: keyof Dictionary; page: TextPageKey; title: string; where: string };

// Friendly names for the top-level parts of the dictionaries.
export const textSections: TextSection[] = [
  { key: "hero", page: "home", title: "Big photo at the top", where: "The first thing visitors see" },
  { key: "search", page: "home", title: "Search box", where: "Find a tour or a transfer" },
  { key: "toursSection", page: "home", title: "Packages carousel", where: "The row of packages" },
  { key: "guides", page: "home", title: "Drivers", where: "Driven by people who know the roads" },
  { key: "firstStep", page: "home", title: "Four photo tiles", where: "Temples, culture, nature, adventure" },
  { key: "transfersFeature", page: "home", title: "Airport pickup", where: "The airport pickup block" },
  { key: "custom", page: "home", title: "“Want somewhere else?” line", where: "Under the packages" },
  { key: "reviews", page: "home", title: "Reviews heading", where: "Above the guest reviews" },
  { key: "toursPage", page: "tours", title: "Tours page heading", where: "Top of the Tours page" },
  { key: "catalog", page: "tours", title: "Filters and sorting", where: "Tours page filters" },
  { key: "tourRow", page: "tours", title: "Package cards", where: "Each package in the list" },
  { key: "tourPage", page: "tours", title: "Package page", where: "Included, not included, drop-off" },
  { key: "bookingCard", page: "tours", title: "Booking box", where: "The request form on a package, and its WhatsApp message" },
  { key: "transferPage", page: "transfers", title: "Transfers page", where: "Results, notes and WhatsApp message" },
  { key: "transfer", page: "transfers", title: "Place groups and times", where: "Names of place groups, seats, durations" },
  { key: "plan", page: "info", title: "Plan your visit page", where: "Facts and how long to stay" },
  { key: "booking", page: "info", title: "How booking works page", where: "The three steps" },
  { key: "faq", page: "info", title: "Questions page", where: "Heading and WhatsApp line" },
  { key: "header", page: "every", title: "Top menu", where: "Menu at the top of every page" },
  { key: "pickers", page: "every", title: "Date, time and passenger pickers", where: "The calendars, time and passenger choosers in the search and booking forms" },
  { key: "pageCta", page: "every", title: "“Ready to choose a trip?” band", where: "Near the bottom of most pages" },
  { key: "footer", page: "every", title: "Footer", where: "Bottom of every page" },
  { key: "notFound", page: "every", title: "Broken link page", where: "Shown when a link is wrong" },
  { key: "meta", page: "google", title: "Google search result", where: "Title and description Google shows" },
];
