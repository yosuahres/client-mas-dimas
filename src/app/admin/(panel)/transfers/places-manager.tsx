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
  airport: "Airport",
  city: "Yogyakarta",
  around: "Around Jogja",
  java: "Across Java",
  sight: "Sights and islands",
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
    <div className="grid gap-10">
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Popular routes</h2>
            <p className="text-sm text-muted-foreground">Shortcuts on the home page and the transfers page, with their lowest price.</p>
          </div>
        </div>
        <ItemList
          list="routes"
          emptyText="No popular routes yet."
          items={routes.map((route) => ({
            key: route.id,
            label: `${placeName(route.from)} to ${placeName(route.to)}`,
            content: (
              <p className="flex items-center gap-2 text-sm">
                {placeName(route.from)}
                <ArrowRight className="size-3.5 text-muted-foreground" />
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
            <h2 className="text-sm font-semibold">Places</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              The From and To choices in the transfer search, grouped as below. The map position is used to estimate the
              distance and price.
            </p>
          </div>
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus />
            Add place
          </Button>
        </div>
        <ItemList
          list="places"
          emptyText="No places yet."
          onEdit={setEditing}
          deleteNote="Popular routes to or from this place are deleted too."
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
    <form key={formKey} onSubmit={onSubmit} noValidate className="mt-3 grid items-end gap-3 rounded-xl border border-dashed p-3 sm:grid-cols-[1fr_1fr_auto]">
      <SelectField name="from" label="From" options={options} placeholder="Choose a place" errors={errors} />
      <SelectField name="to" label="To" options={options} placeholder="Choose a place" errors={errors} />
      <Button type="submit" variant="outline" disabled={pending}>
        <Plus />
        Add route
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
      title={place ? `Edit ${translate(place.name, "id")}` : "Add a place"}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={place ? "Save place" : "Add place"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="id" label="Short name" placeholder="parangtritis" defaultValue={place?.id} errors={errors} hint="Lowercase, used in links." />
        <SelectField
          name="kind"
          label="Group"
          options={placeKinds.map((kind) => ({ value: kind, label: kindLabels[kind] }))}
          defaultValue={place?.kind ?? "around"}
          errors={errors}
        />
        <TextField name="lat" label="Latitude" inputMode="decimal" placeholder="-7.7956" defaultValue={place?.lat} errors={errors} />
        <TextField name="lng" label="Longitude" inputMode="decimal" placeholder="110.3695" defaultValue={place?.lng} errors={errors} />
        <p className="text-xs text-muted-foreground sm:col-span-2">
          In Google Maps, right-click the place and click the numbers at the top to copy them: the first is the latitude, the
          second the longitude.
        </p>
      </div>
      <LocaleTabs errors={errors} prefixes={["name"]}>
        {(locale) => (
          <TextField
            name={`name.${locale}`}
            label="Name"
            defaultValue={place?.name[locale]}
            placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
            errors={errors}
          />
        )}
      </LocaleTabs>
      <SwitchField name="published" label="Show on the website" defaultChecked={place?.published ?? true} />
    </RecordDialog>
  );
}
