import type { Dictionary } from "@/i18n/dictionaries/en";

// Friendly names for the top-level parts of the dictionaries, in the order they appear on the site.
export const textSections: { key: keyof Dictionary; title: string; where: string }[] = [
  { key: "meta", title: "Search engines", where: "Title and description Google shows" },
  { key: "header", title: "Header", where: "Menu at the top of every page" },
  { key: "hero", title: "Home: top", where: "Big photo and headline" },
  { key: "search", title: "Trip search", where: "Tour and transfer search box" },
  { key: "toursSection", title: "Home: packages", where: "Package carousel" },
  { key: "guides", title: "Home: drivers", where: "Driven by people who know the roads" },
  { key: "firstStep", title: "Home: first stop", where: "Four photo tiles" },
  { key: "transfersFeature", title: "Home: transfers", where: "Airport pickup feature" },
  { key: "custom", title: "Custom trips", where: "Want somewhere else? line" },
  { key: "reviews", title: "Reviews heading", where: "Title and Google rating line" },
  { key: "plan", title: "Plan your visit", where: "Plan your visit page" },
  { key: "booking", title: "How booking works", where: "How booking works page" },
  { key: "faq", title: "Questions page", where: "Heading and WhatsApp line" },
  { key: "toursPage", title: "Tours page", where: "Tours page heading" },
  { key: "catalog", title: "Tours filters", where: "Filters and sorting" },
  { key: "tourRow", title: "Package cards", where: "Card teaser and button" },
  { key: "tourPage", title: "Package page", where: "Included, not included, notes" },
  { key: "bookingCard", title: "Booking card", where: "Request form and WhatsApp message" },
  { key: "transfer", title: "Transfer labels", where: "Place groups, seats, durations" },
  { key: "transferPage", title: "Transfers page", where: "Transfer results and WhatsApp message" },
  { key: "pageCta", title: "Bottom call to action", where: "Ready to choose a trip?" },
  { key: "footer", title: "Footer", where: "Bottom of every page" },
  { key: "notFound", title: "Page not found", where: "Shown for broken links" },
];
