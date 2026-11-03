import { Bus, CircleCheck, CircleHelp, CircleAlert, Map as MapIcon, MapPinned, MessageSquareQuote, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ElementType } from "react";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminFaqs, adminPlaces, adminReviews, adminTextOverrides, adminTours, adminVehicles } from "@/lib/admin/queries";
import { isTranslationConfigured } from "@/lib/machine-translation/google";
import { isR2Configured } from "@/lib/r2";

export const metadata: Metadata = { title: "Dashboard" };

type Count = {
  href: string;
  title: string;
  icon: ElementType;
  shown: number;
  total: number;
};

export default async function DashboardPage() {
  const [tours, vehicles, places, reviews, faqs, text] = await Promise.all([
    adminTours(),
    adminVehicles(),
    adminPlaces(),
    adminReviews(),
    adminFaqs(),
    adminTextOverrides(),
  ]);
  const shown = (items: { published: boolean }[]) => items.filter((item) => item.published).length;
  const counts: Count[] = [
    { href: "/admin/tours", title: "Tour packages", icon: MapIcon, shown: shown(tours), total: tours.length },
    { href: "/admin/fleet", title: "Cars", icon: Bus, shown: shown(vehicles), total: vehicles.length },
    { href: "/admin/transfers", title: "Places", icon: MapPinned, shown: shown(places), total: places.length },
    { href: "/admin/reviews", title: "Reviews", icon: MessageSquareQuote, shown: shown(reviews), total: reviews.length },
    { href: "/admin/faq", title: "Questions", icon: CircleHelp, shown: shown(faqs), total: faqs.length },
  ];
  const editedText = Object.values(text).reduce((sum, edits) => sum + Object.keys(edits).length, 0);
  const untranslated = tours.filter((tour) => !tour.text.id || !tour.text.fr);
  const sampleReviews = reviews.filter((review) => review.guestName === "Sample guest" && review.published);

  const checks = [
    {
      ok: isTranslationConfigured(),
      good: "English and French are translated automatically from the Indonesian.",
      bad: "Automatic translation isn't set up: add GOOGLE_TRANSLATE_API_KEY on the server.",
    },
    { ok: isR2Configured(), good: "Photo uploads are set up.", bad: "Photo uploads aren't set up: add the R2 settings on the server." },
    {
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      good: "Admin users can be managed here.",
      bad: "Add SUPABASE_SERVICE_ROLE_KEY on the server to manage admin users here.",
    },
    {
      ok: sampleReviews.length === 0,
      good: "All shown reviews are real.",
      bad: `${sampleReviews.length} sample review${sampleReviews.length === 1 ? " is" : "s are"} still shown. Replace them with real Google reviews.`,
    },
    {
      ok: untranslated.length === 0,
      good: "Every package is in English, Indonesian and French.",
      bad: `${untranslated.length} package${untranslated.length === 1 ? " is" : "s are"} missing Indonesian or French; English is shown instead.`,
    },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <PageBody>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map((count) => (
            <li key={count.href}>
              <Link href={count.href} className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent">
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <count.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{count.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {count.shown} shown{count.total > count.shown ? `, ${count.total - count.shown} hidden` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin/text" className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                <Type className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">Website text</span>
                <span className="block text-xs text-muted-foreground">
                  {editedText === 0 ? "As written" : `${editedText} edit${editedText === 1 ? "" : "s"}`}
                </span>
              </span>
            </Link>
          </li>
        </ul>

        <section className="mt-8 rounded-xl border">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Checklist</h2>
          <ul>
            {checks.map((check) => (
              <li key={check.good} className="flex items-start gap-2.5 border-b px-4 py-2.5 text-sm last:border-b-0">
                {check.ok ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                )}
                {check.ok ? check.good : check.bad}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-sm text-muted-foreground">
          Changes show on the website as soon as you save. If you edit straight in the Supabase dashboard instead, the website
          catches up within an hour.
        </p>
      </PageBody>
    </>
  );
}
