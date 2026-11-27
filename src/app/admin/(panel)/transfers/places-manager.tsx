"use client";

import { ArrowRight, MapPin, Plus } from "lucide-react";
import { useState } from "react";

import { CarPricesField, type PriceCar } from "@/app/admin/(panel)/tours/car-prices-field";
import { addRoute, savePlace, saveRoutePrices } from "@/app/admin/(panel)/transfers/actions";
import { autoTranslatedPlaceholder, LocaleTabs, SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { placeKinds, type PlaceKind, type PlaceRecord, type RouteRecord } from "@/lib/content/schema";
import { translate } from "@/lib/content/translate";
import { formatIdr } from "@/lib/money";
import { cheapestCarPrice } from "@/lib/pricing";

const kindLabels: Record<PlaceKind, string> = {
  airport: "Bandara",
  city: "Yogyakarta",
  around: "Sekitar Jogja",
  java: "Antarkota di Jawa",
  sight: "Wisata dan pulau",
};

type Route = RouteRecord & { id: string };

type PlacesManagerProps = {
  places: PlaceRecord[];
  routes: Route[];
  /** Every car, for the price boxes on each route. */
  cars: PriceCar[];
};

export function PlacesManager({ places, routes, cars }: PlacesManagerProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const place = places.find((candidate) => candidate.id === editing) ?? null;
  // The route whose prices are open, by id.
  const [pricing, setPricing] = useState<string | null>(null);
  const pricedRoute = routes.find((candidate) => candidate.id === pricing) ?? null;
  const shownCars = cars.filter((car) => car.published);
  const placeName = (id: string) => {
    const place = places.find((candidate) => candidate.id === id);
    return place ? translate(place.name, "id") : id;
  };

  return (
    <div className="grid grid-cols-1 gap-10">
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold">Rute dan harga</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Ketuk rute untuk mengisi harga per mobil. Perjalanan yang tidak ada di daftar: tamu melihat Hubungi kami.
        </p>
        <ItemList
          list="routes"
          emptyText="Belum ada rute."
          onEdit={setPricing}
          items={routes.map((route) => {
            const from = cheapestCarPrice(route.carPrices, shownCars);
            return {
              key: route.id,
              label: `${placeName(route.from)} ke ${placeName(route.to)}`,
              content: (
                <div className="min-w-0">
                  <p className="text-sm">
                    {placeName(route.from)}
                    <ArrowRight className="mx-1.5 inline size-3.5 align-[-2px] text-muted-foreground" />
                    {placeName(route.to)}
                  </p>
                  <p className="text-xs text-muted-foreground">{from === null ? "Belum ada harga: Hubungi kami" : `mulai ${formatIdr(from, "id")}`}</p>
                </div>
              ),
            };
          })}
        />
        <AddRouteForm places={places} />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold">Tempat</h2>
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus />
            Tambah tempat
          </Button>
        </div>
        <ItemList
          list="places"
          emptyText="Belum ada tempat."
          onEdit={setEditing}
          deleteNote="Rute populer dari atau ke tempat ini ikut terhapus."
          items={places.map((candidate) => ({
            key: candidate.id,
            label: translate(candidate.name, "id"),
            published: candidate.published,
            content: (
              <p className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                <span className="truncate font-medium">{translate(candidate.name, "id")}</span>
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                  {kindLabels[candidate.kind]}
                </Badge>
              </p>
            ),
          }))}
        />
      </section>

      {editing !== null ? <PlaceDialog key={editing} place={place} onClose={() => setEditing(null)} /> : null}
      {pricedRoute ? (
        <RoutePricesDialog
          key={pricedRoute.id}
          route={pricedRoute}
          title={`${placeName(pricedRoute.from)} ke ${placeName(pricedRoute.to)}`}
          cars={cars}
          onClose={() => setPricing(null)}
        />
      ) : null}
    </div>
  );
}

function AddRouteForm({ places }: { places: PlaceRecord[] }) {
  // Remounted after each route is added, so the pickers clear.
  const [formKey, setFormKey] = useState(0);
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(addRoute, { onSuccess: () => setFormKey((key) => key + 1) });
  const options = places.map((place) => ({ value: place.id, label: translate(place.name, "id") }));

  return (
    <form key={formKey} onSubmit={onSubmit} noValidate className="mt-3 grid grid-cols-1 items-end gap-3 rounded-xl border border-dashed p-3 sm:grid-cols-[1fr_1fr_auto]">
      <SelectField name="from" label="Dari" options={options} placeholder="Pilih tempat" errors={errors} />
      <SelectField name="to" label="Ke" options={options} placeholder="Pilih tempat" errors={errors} />
      <Button type="submit" variant="outline" disabled={pending}>
        <Plus />
        Tambah rute
      </Button>
    </form>
  );
}

type RoutePricesDialogProps = { route: Route; title: string; cars: PriceCar[]; onClose: () => void };

function RoutePricesDialog({ route, title, cars, onClose }: RoutePricesDialogProps) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveRoutePrices.bind(null, route.id), { onSuccess: onClose });
  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={title}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel="Simpan harga"
    >
      <div className="grid gap-2">
        <div>
          <p className="text-[13px] font-medium">Harga per mobil (Rp)</p>
          <p className="text-xs text-muted-foreground">Berlaku dua arah. Kosong: tamu melihat Hubungi kami untuk mobil itu.</p>
        </div>
        <CarPricesField cars={cars} name="carPrices" defaultValues={route.carPrices} errors={errors} />
      </div>
    </RecordDialog>
  );
}

function PlaceDialog({ place, onClose }: { place: PlaceRecord | null; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(savePlace.bind(null, place?.id ?? null), { onSuccess: onClose });

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={place ? `Ubah ${translate(place.name, "id")}` : "Tambah tempat"}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={place ? "Simpan tempat" : "Tambah tempat"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="kind"
          label="Kelompok"
          options={placeKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }))}
          defaultValue={place?.kind ?? "around"}
          errors={errors}
        />
        <div className="grid gap-1.5 sm:col-span-2">
          <TextField
            name="location"
            label="Lokasi di Google Maps"
            inputMode="url"
            autoComplete="off"
            placeholder="https://maps.app.goo.gl/…"
            defaultValue={place ? `${place.lat}, ${place.lng}` : ""}
            errors={errors}
          />
          {place ? (
            <a
              href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 w-fit items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline md:min-h-0"
            >
              <MapPin className="size-3.5" />
              Lihat posisi yang tersimpan di Google Maps
            </a>
          ) : null}
        </div>
      </div>
      <LocaleTabs errors={errors} prefixes={["name"]}>
        {(locale) => (
          <TextField
            name={`name.${locale}`}
            label="Nama"
            defaultValue={place?.name[locale]}
            placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
            errors={errors}
          />
        )}
      </LocaleTabs>
      <SwitchField name="published" label="Tampilkan di website" defaultChecked={place?.published ?? true} />
    </RecordDialog>
  );
}
