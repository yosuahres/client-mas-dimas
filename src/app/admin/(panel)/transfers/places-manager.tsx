"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

import { addRoute, savePlace } from "@/app/admin/(panel)/transfers/actions";
import { autoTranslatedPlaceholder, LocaleTabs, SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { placeKinds, type PlaceKind, type PlaceRecord, type RouteRecord } from "@/lib/content/schema";
import { translate } from "@/lib/content/translate";

const kindLabels: Record<PlaceKind, string> = {
  airport: "Bandara",
  city: "Yogyakarta",
  around: "Sekitar Jogja",
  java: "Antarkota di Jawa",
  sight: "Wisata dan pulau",
};

type PlacesManagerProps = {
  places: PlaceRecord[];
  routes: (RouteRecord & { id: string })[];
};

export function PlacesManager({ places, routes }: PlacesManagerProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const place = places.find((candidate) => candidate.id === editing) ?? null;
  const placeName = (id: string) => {
    const place = places.find((candidate) => candidate.id === id);
    return place ? translate(place.name, "id") : id;
  };

  return (
    <div className="grid grid-cols-1 gap-10">
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Rute populer</h2>
            <p className="text-sm text-muted-foreground">Pintasan di beranda dan halaman antar jemput, dengan harga terendahnya.</p>
          </div>
        </div>
        <ItemList
          list="routes"
          emptyText="Belum ada rute populer."
          items={routes.map((route) => ({
            key: route.id,
            label: `${placeName(route.from)} ke ${placeName(route.to)}`,
            content: (
              <p className="text-sm">
                {placeName(route.from)}
                <ArrowRight className="mx-1.5 inline size-3.5 align-[-2px] text-muted-foreground" />
                {placeName(route.to)}
              </p>
            ),
          }))}
        />
        <AddRouteForm places={places} />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Tempat</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Pilihan Dari dan Ke di pencarian antar jemput, dikelompokkan seperti di bawah. Posisi di peta dipakai untuk
              memperkirakan jarak dan harga.
            </p>
          </div>
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
        <TextField name="id" label="Nama pendek" placeholder="parangtritis" defaultValue={place?.id} errors={errors} hint="Huruf kecil, dipakai di link." />
        <SelectField
          name="kind"
          label="Kelompok"
          options={placeKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }))}
          defaultValue={place?.kind ?? "around"}
          errors={errors}
        />
        <TextField name="lat" label="Latitude" inputMode="decimal" placeholder="-7.7956" defaultValue={place?.lat} errors={errors} />
        <TextField name="lng" label="Longitude" inputMode="decimal" placeholder="110.3695" defaultValue={place?.lng} errors={errors} />
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Di Google Maps, klik kanan tempatnya lalu klik angka di paling atas untuk menyalinnya: angka pertama latitude, yang
          kedua longitude. Di HP: tekan lama tempatnya, angkanya muncul di kolom pencarian.
        </p>
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
