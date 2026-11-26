"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { saveVehicle } from "@/app/admin/(panel)/fleet/actions";
import { SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { seatClasses, type SeatClass, type VehicleRecord } from "@/lib/content/schema";
import { formatIdr } from "@/lib/money";
import { cn } from "@/lib/utils";
import { tourPriceInVehicle, transferFare } from "@/lib/pricing";

export type PriceSamples = {
  /** A package and its price for the cheapest car, or null when no package has a price. */
  tour: { name: string; priceIdr: number } | null;
  /** Popular routes with their estimated road distance. */
  routes: { name: string; distanceKm: number }[];
};

const seatClassLabels: Record<SeatClass, string> = { five: "5 kursi", seven: "7 kursi", large: "Lebih dari 7 kursi" };

export function FleetManager({ vehicles, samples }: { vehicles: VehicleRecord[]; samples: PriceSamples }) {
  // null: closed; "new": adding; otherwise the id being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const vehicle = vehicles.find((candidate) => candidate.id === editing) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Tamu memilih kelompok kursi, bukan mobil: kelompok terkecil yang muat dan satu di atasnya, masing-masing dengan harga
          mobil termurah yang muat. Mobil yang punya tarif antar jemput diberi harga di halaman Bandara &amp; antar jemput.
        </p>
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
                {seatClassLabels[car.seatClass]} · {car.seats} kursi · {car.maxPassengers} orang, {car.maxPassengersWithLuggage} dengan bagasi · harga paket{" "}
                {car.tourPricePercent}% · {formatIdr(car.dayWithDriverIdr, "id")} / hari dengan sopir ·{" "}
                {formatIdr(car.dayWithDriverAndFuelIdr, "id")} dengan BBM
                {car.transferRate ? ` · antar jemput mulai ${formatIdr(car.transferRate.minimumIdr, "id")}` : " · tanpa antar jemput"}
              </p>
            </div>
          ),
        }))}
      />
      {editing !== null ? (
        <VehicleDialog key={editing} vehicle={vehicle} samples={samples} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}

/** A typed rupiah or percent ("550.000", "Rp 550,000"), or null while it's empty. */
function typedNumber(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function VehicleDialog({ vehicle, samples, onClose }: { vehicle: VehicleRecord | null; samples: PriceSamples; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveVehicle.bind(null, vehicle?.id ?? null), { onSuccess: onClose });
  const [offersTransfers, setOffersTransfers] = useState(vehicle ? vehicle.transferRate !== null : true);
  const [seating, setSeating] = useState({
    seatClass: vehicle?.seatClass ?? ("seven" as SeatClass),
    seats: vehicle?.seats ?? "",
    maxPassengers: String(vehicle?.maxPassengers ?? ""),
    withLuggage: String(vehicle?.maxPassengersWithLuggage ?? ""),
  });
  const maxPassengers = typedNumber(seating.maxPassengers);
  const withLuggage = typedNumber(seating.withLuggage);
  // Typed values, read live for the price examples.
  const [percent, setPercent] = useState(String(vehicle?.tourPricePercent ?? 100));
  const [rate, setRate] = useState({
    baseIdr: String(vehicle?.transferRate?.baseIdr ?? ""),
    perKmIdr: String(vehicle?.transferRate?.perKmIdr ?? ""),
    minimumIdr: String(vehicle?.transferRate?.minimumIdr ?? ""),
  });

  const percentValue = typedNumber(percent);
  const tourExample =
    samples.tour && percentValue ? tourPriceInVehicle(samples.tour.priceIdr, { tourPricePercent: percentValue }) : null;
  const perKm = typedNumber(rate.perKmIdr);
  const fareRate = perKm ? { baseIdr: typedNumber(rate.baseIdr) ?? 0, perKmIdr: perKm, minimumIdr: typedNumber(rate.minimumIdr) ?? 0 } : null;
  const routes = samples.routes.length > 0 ? samples.routes : [{ name: "Perjalanan 20 km", distanceKm: 20 }];

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={vehicle ? `Ubah ${vehicle.name}` : "Tambah mobil"}
      description="Semua harga dalam rupiah, untuk satu mobil."
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
            hint="Tamu memilih kelompok, bukan nama mobil."
          />
          <TextField
            name="seats"
            label="Jumlah kursi"
            placeholder="7 atau 10–12"
            value={seating.seats}
            onChange={(event) => setSeating({ ...seating, seats: event.target.value })}
            errors={errors}
            hint="Ditulis di hasil pencarian, misalnya “7 kursi”."
          />
          <TextField
            name="maxPassengers"
            label="Muat berapa orang"
            inputMode="numeric"
            value={seating.maxPassengers}
            onChange={(event) => setSeating({ ...seating, maxPassengers: event.target.value })}
            errors={errors}
            hint="Tanpa koper besar. Dewasa dan anak; bayi dipangku tidak dihitung."
          />
          <TextField
            name="maxPassengersWithLuggage"
            label="Muat berapa orang dengan koper"
            inputMode="numeric"
            value={seating.withLuggage}
            onChange={(event) => setSeating({ ...seating, withLuggage: event.target.value })}
            errors={errors}
            hint="Kalau semua membawa koper atau tas besar."
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

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="dayWithDriverIdr" label="Tarif harian dengan sopir" inputMode="numeric" defaultValue={vehicle?.dayWithDriverIdr} errors={errors} />
        <TextField
          name="dayWithDriverAndFuelIdr"
          label="Tarif harian dengan sopir dan BBM"
          inputMode="numeric"
          defaultValue={vehicle?.dayWithDriverAndFuelIdr}
          errors={errors}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          name="tourPricePercent"
          label="Harga paket tour untuk mobil ini (%)"
          inputMode="numeric"
          placeholder="100"
          value={percent}
          onChange={(event) => setPercent(event.target.value)}
          errors={errors}
          hint="Harga di setiap paket berlaku untuk mobil termurah. 100 = sama, 150 = satu setengah kalinya."
        />
        <GuestExample title="Contoh harga paket untuk tamu">
          {samples.tour ? (
            <p>
              {samples.tour.name}: <span className="text-muted-foreground">harga di paket {formatIdr(samples.tour.priceIdr, "id")}</span>
              <br />
              Dengan mobil ini: <strong>{tourExample ? formatIdr(tourExample, "id") : "—"}</strong>
            </p>
          ) : (
            <p className="text-muted-foreground">Belum ada paket dengan harga untuk contoh.</p>
          )}
        </GuestExample>
      </div>

      <SwitchField
        name="offersTransfers"
        label="Layani antar jemput"
        hint="Beri harga mobil ini untuk jemput bandara dan perjalanan antarkota."
        defaultChecked={offersTransfers}
        onCheckedChange={setOffersTransfers}
      />
      {offersTransfers ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            name="transferRate.baseIdr"
            label="Biaya awal"
            inputMode="numeric"
            value={rate.baseIdr}
            onChange={(event) => setRate({ ...rate, baseIdr: event.target.value })}
            errors={errors}
          />
          <TextField
            name="transferRate.perKmIdr"
            label="Per km"
            inputMode="numeric"
            value={rate.perKmIdr}
            onChange={(event) => setRate({ ...rate, perKmIdr: event.target.value })}
            errors={errors}
          />
          <TextField
            name="transferRate.minimumIdr"
            label="Harga terendah"
            inputMode="numeric"
            value={rate.minimumIdr}
            onChange={(event) => setRate({ ...rate, minimumIdr: event.target.value })}
            errors={errors}
            hint="Untuk perjalanan pendek."
          />
          <GuestExample title="Contoh harga antar jemput untuk tamu" className="sm:col-span-3">
            <ul className="grid gap-1">
              {routes.map((route) => (
                <li key={route.name} className="flex flex-wrap justify-between gap-x-3">
                  <span>
                    {route.name} <span className="text-muted-foreground">(± {route.distanceKm} km)</span>
                  </span>
                  <strong>{fareRate ? formatIdr(transferFare(fareRate, route.distanceKm), "id") : "—"}</strong>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Biaya awal + per km × jarak, minimal harga terendah, dibulatkan ke atas ke Rp 5.000.
            </p>
          </GuestExample>
        </div>
      ) : null}

      <SwitchField name="published" label="Tampilkan di website" defaultChecked={vehicle?.published ?? true} />
    </RecordDialog>
  );
}

function GuestExample({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm", className)} aria-live="polite">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
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
