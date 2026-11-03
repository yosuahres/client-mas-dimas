"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { saveVehicle } from "@/app/admin/(panel)/fleet/actions";
import { SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { VehicleRecord } from "@/lib/content/schema";
import { formatIdr } from "@/lib/money";

export function FleetManager({ vehicles }: { vehicles: VehicleRecord[] }) {
  // null: closed; "new": adding; otherwise the id being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const vehicle = vehicles.find((candidate) => candidate.id === editing) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Day rates are listed on each package&apos;s booking card. Cars with a transfer rate are priced on the Airport &amp;
          transfers page.
        </p>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Add car
        </Button>
      </div>
      <ItemList
        list="vehicles"
        emptyText="No cars yet."
        onEdit={setEditing}
        items={vehicles.map((car) => ({
          key: car.id,
          label: car.name,
          published: car.published,
          content: (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{car.name}</p>
              <p className="text-xs text-muted-foreground">
                {car.seats} seats · {formatIdr(car.dayWithDriverIdr, "en")} / day with driver ·{" "}
                {formatIdr(car.dayWithDriverAndFuelIdr, "en")} with fuel
                {car.transferRate ? ` · transfers from ${formatIdr(car.transferRate.minimumIdr, "en")}` : " · no transfers"}
              </p>
            </div>
          ),
        }))}
      />
      {editing !== null ? (
        <VehicleDialog key={editing} vehicle={vehicle} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}

function VehicleDialog({ vehicle, onClose }: { vehicle: VehicleRecord | null; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveVehicle.bind(null, vehicle?.id ?? null), { onSuccess: onClose });
  const [offersTransfers, setOffersTransfers] = useState(vehicle ? vehicle.transferRate !== null : true);

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={vehicle ? `Edit ${vehicle.name}` : "Add a car"}
      description="All prices are in rupiah, for the whole car."
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={vehicle ? "Save car" : "Add car"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Name" placeholder="Toyota Avanza" defaultValue={vehicle?.name} errors={errors} />
        <TextField name="id" label="Short name" placeholder="avanza" defaultValue={vehicle?.id} errors={errors} hint="Lowercase, used in links." />
        <TextField name="seats" label="Seats (as shown)" placeholder="7 or 10–12" defaultValue={vehicle?.seats} errors={errors} />
        <TextField name="maxPassengers" label="Most passengers" inputMode="numeric" defaultValue={vehicle?.maxPassengers} errors={errors} />
        <TextField name="dayWithDriverIdr" label="Day rate with driver" inputMode="numeric" defaultValue={vehicle?.dayWithDriverIdr} errors={errors} />
        <TextField
          name="dayWithDriverAndFuelIdr"
          label="Day rate with driver and fuel"
          inputMode="numeric"
          defaultValue={vehicle?.dayWithDriverAndFuelIdr}
          errors={errors}
        />
      </div>

      <SwitchField
        name="offersTransfers"
        label="Offer for transfers"
        hint="Price this car for airport pickups and drives between towns."
        defaultChecked={offersTransfers}
        onCheckedChange={setOffersTransfers}
      />
      {offersTransfers ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="transferRate.baseIdr" label="Start fee" inputMode="numeric" defaultValue={vehicle?.transferRate?.baseIdr} errors={errors} />
          <TextField name="transferRate.perKmIdr" label="Per km" inputMode="numeric" defaultValue={vehicle?.transferRate?.perKmIdr} errors={errors} />
          <TextField
            name="transferRate.minimumIdr"
            label="Lowest price"
            inputMode="numeric"
            defaultValue={vehicle?.transferRate?.minimumIdr}
            errors={errors}
            hint="For short trips."
          />
          <p className="text-xs text-muted-foreground sm:col-span-3">
            Transfer price = start fee + per km × distance, never below the lowest price, rounded up to the next Rp 5,000.
          </p>
        </div>
      ) : null}

      <SwitchField name="published" label="Show on the website" defaultChecked={vehicle?.published ?? true} />
    </RecordDialog>
  );
}
