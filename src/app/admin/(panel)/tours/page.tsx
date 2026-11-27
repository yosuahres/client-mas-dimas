import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ItemList } from "@/components/admin/item-list";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/money";
import { adminTours, adminVehicles } from "@/lib/admin/queries";
import { cheapestCarPrice } from "@/lib/pricing";
import { photoUrl } from "@/lib/photos";
import { translateFields } from "@/lib/content/translate";

export const metadata: Metadata = { title: "Paket tour" };

export default async function ToursPage() {
  const [tours, vehicles] = await Promise.all([adminTours(), adminVehicles()]);
  // The same "from" price guests see: the lowest across the cars on the website.
  const shownCars = vehicles.filter((vehicle) => vehicle.published);

  return (
    <>
      <PageHeader
        title="Paket tour"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/tours/new">
              <Plus />
              Paket baru
            </Link>
          </Button>
        }
      />
      <PageBody>
        <ItemList
          list="tours"
          emptyText="Belum ada paket. Tambahkan paket pertama."
          deleteNote="Ulasan untuk paket ini tetap ada, tanpa nama paketnya."
          items={tours.map((tour) => {
            const photo = photoUrl(tour.photo);
            const priceFrom = cheapestCarPrice(tour.carPrices, shownCars);
            return {
              key: tour.slug,
              label: translateFields(tour.text, "id").name,
              published: tour.published,
              href: `/admin/tours/${tour.slug}`,
              content: (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                    {photo ? <img src={photo} alt="" className="size-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium sm:line-clamp-1">
                      <span className="mr-1.5 text-muted-foreground">{tour.code}</span>
                      {translateFields(tour.text, "id").name}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {tour.length === "multi-day" ? "Beberapa hari" : "Perjalanan sehari"} ·{" "}
                      {priceFrom === null ? "Hubungi kami" : `mulai ${formatIdr(priceFrom, "id")}`}
                      {/* Left out on phones, where it wrapped the row to four lines; the edit page has it. */}
                      {tour.accommodationOffered ? (
                        <span className="hidden sm:inline">
                          · termasuk akomodasi{" "}
                          {tour.accommodationPriceFromIdr === null ? "hubungi kami" : `mulai ${formatIdr(tour.accommodationPriceFromIdr, "id")}`}
                        </span>
                      ) : null}
                      {!tour.text.id || !tour.text.fr ? (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                          {!tour.text.id && !tour.text.fr ? "Hanya bahasa Inggris" : !tour.text.id ? "Tanpa bahasa Indonesia" : "Tanpa bahasa Prancis"}
                        </Badge>
                      ) : null}
                    </p>
                  </div>
                </div>
              ),
            };
          })}
        />
      </PageBody>
    </>
  );
}
