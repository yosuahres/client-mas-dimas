import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ItemList } from "@/components/admin/item-list";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/money";
import { adminTours } from "@/lib/admin/queries";
import { photoUrl } from "@/lib/photos";
import { translateFields } from "@/lib/content/translate";

export const metadata: Metadata = { title: "Paket tour" };

export default async function ToursPage() {
  const tours = await adminTours();

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
        <p className="mb-4 text-sm text-muted-foreground">
          Paket di halaman Tour, sesuai urutan ini. Foto paket pertama dipakai di beranda.
        </p>
        <ItemList
          list="tours"
          emptyText="Belum ada paket. Tambahkan paket pertama."
          deleteNote="Ulasan untuk paket ini tetap ada, tanpa nama paketnya."
          items={tours.map((tour) => {
            const photo = photoUrl(tour.photo);
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
                    <p className="truncate text-sm font-medium">
                      <span className="mr-1.5 text-muted-foreground">{tour.code}</span>
                      {translateFields(tour.text, "id").name}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {tour.length === "multi-day" ? "Beberapa hari" : "Perjalanan sehari"} ·{" "}
                      {tour.priceFromIdr === null ? "Hubungi kami" : `mulai ${formatIdr(tour.priceFromIdr, "id")}`}
                      {tour.accommodationOffered
                        ? ` · termasuk akomodasi ${tour.accommodationPriceFromIdr === null ? "hubungi kami" : `mulai ${formatIdr(tour.accommodationPriceFromIdr, "id")}`}`
                        : null}
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
