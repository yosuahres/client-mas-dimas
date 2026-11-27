"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { saveVehicle } from "@/app/admin/(panel)/fleet/actions";
import { GuestExample, SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { seatClassLabels } from "@/components/admin/seat-class-labels";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { seatClasses, type SeatClass, type VehicleRecord } from "@/lib/content/schema";

export function FleetManager({ vehicles }: { vehicles: VehicleRecord[] }) {
  // null: closed; "new": adding; otherwise the id being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const vehicle = vehicles.find((candidate) => candidate.id === editing) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Tambah mobil
        </Button>
      </div>
      <ItemList
        list="vehicles"
        emptyText="Belum ada mobil."
        onEdit={setEditing}
        items={vehicles.map((car) => ({
          key: car.id,
          label: car.name,
          published: car.published,
          content: (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{car.name}</p>
              <p className="text-xs text-muted-foreground">
                {seatClassLabels[car.seatClass]} · {car.seats} kursi · {car.maxPassengers} orang, {car.maxPassengersWithLuggage} dengan bagasi
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

/** A typed number ("550.000", "Rp 550,000"), or null while it's empty. */
function typedNumber(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function VehicleDialog({ vehicle, onClose }: { vehicle: VehicleRecord | null; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveVehicle.bind(null, vehicle?.id ?? null), { onSuccess: onClose });
  const [seating, setSeating] = useState({
    seatClass: vehicle?.seatClass ?? ("seven" as SeatClass),
    seats: vehicle?.seats ?? "",
    maxPassengers: String(vehicle?.maxPassengers ?? ""),
    withLuggage: String(vehicle?.maxPassengersWithLuggage ?? ""),
  });
  const maxPassengers = typedNumber(seating.maxPassengers);
  const withLuggage = typedNumber(seating.withLuggage);

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={vehicle ? `Ubah ${vehicle.name}` : "Tambah mobil"}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={vehicle ? "Simpan mobil" : "Tambah mobil"}
    >
      <TextField name="name" label="Nama mobil" placeholder="Toyota Avanza" defaultValue={vehicle?.name} errors={errors} />

      <FormGroup title="Kursi dan muatan">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="seatClass"
            label="Kelompok di website"
            options={seatClasses.map((value) => ({ value, label: seatClassLabels[value] }))}
            defaultValue={seating.seatClass}
            onValueChange={(value) => setSeating({ ...seating, seatClass: value as SeatClass })}
            errors={errors}
          />
          <TextField
            name="seats"
            label="Jumlah kursi"
            placeholder="7 atau 10–12"
            value={seating.seats}
            onChange={(event) => setSeating({ ...seating, seats: event.target.value })}
            errors={errors}
          />
          <TextField
            name="maxPassengers"
            label="Muat berapa orang"
            inputMode="numeric"
            value={seating.maxPassengers}
            onChange={(event) => setSeating({ ...seating, maxPassengers: event.target.value })}
            errors={errors}
          />
          <TextField
            name="maxPassengersWithLuggage"
            label="Muat berapa orang dengan koper"
            inputMode="numeric"
            value={seating.withLuggage}
            onChange={(event) => setSeating({ ...seating, withLuggage: event.target.value })}
            errors={errors}
          />
        </div>
        <GuestExample title="Yang dilihat tamu">
          <p>
            Tampil di kelompok <strong>{seatClassLabels[seating.seatClass]}</strong>
            {seating.seats.trim() ? <>, ditulis “{seating.seats.trim()} kursi”</> : null}.
            {maxPassengers ? (
              <>
                {" "}
                Ditawarkan untuk rombongan sampai <strong>{maxPassengers} orang</strong>
                {withLuggage ? (
                  <>
                    , atau <strong>{withLuggage} orang</strong> kalau membawa koper
                  </>
                ) : null}
                .
              </>
            ) : null}
          </p>
        </GuestExample>
      </FormGroup>

      <SwitchField name="published" label="Tampilkan di website" defaultChecked={vehicle?.published ?? true} />
    </RecordDialog>
  );
}

/** A titled group of fields, divided from the rest by a hairline. */
function FormGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-t pt-4">
      <legend className="float-left mb-1 w-full text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
