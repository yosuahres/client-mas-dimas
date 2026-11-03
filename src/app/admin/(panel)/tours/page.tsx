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

export const metadata: Metadata = { title: "Tour packages" };

export default async function ToursPage() {
  const tours = await adminTours();

  return (
    <>
      <PageHeader
        title="Tour packages"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/tours/new">
              <Plus />
              New package
            </Link>
          </Button>
        }
      />
      <PageBody>
        <p className="mb-4 text-sm text-muted-foreground">
          The packages on the Tours page, in this order. The first one is the photo on the home page.
        </p>
        <ItemList
          list="tours"
          emptyText="No packages yet. Add the first one."
          deleteNote="Reviews of this package stay, without the package name."
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
                      {tour.length === "multi-day" ? "Multi-day" : "Day trip"} ·{" "}
                      {tour.priceFromIdr === null ? "On request" : `from ${formatIdr(tour.priceFromIdr, "en")}`}
                      {!tour.text.id || !tour.text.fr ? (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                          {!tour.text.id && !tour.text.fr ? "English only" : !tour.text.id ? "No Indonesian" : "No French"}
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
