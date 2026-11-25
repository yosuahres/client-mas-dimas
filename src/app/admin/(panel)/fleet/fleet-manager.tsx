"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { saveVehicle } from "@/app/admin/(panel)/fleet/actions";
import { SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { seatClasses, type SeatClass, type VehicleRecord } from "@/lib/content/schema";
import { formatIdr } from "@/lib/money";

const seatClassLabels: Record<SeatClass, string> = { five: "5 kursi", seven: "7 kursi", large: "Lebih dari 7 kursi" };

export function FleetManager({ vehicles }: { vehicles: VehicleRecord[] }) {
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
      title={vehicle ? `Ubah ${vehicle.name}` : "Tambah mobil"}
      description="Semua harga dalam rupiah, untuk satu mobil."
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={vehicle ? "Simpan mobil" : "Tambah mobil"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Nama" placeholder="Toyota Avanza" defaultValue={vehicle?.name} errors={errors} />
        <TextField name="id" label="Nama pendek" placeholder="avanza" defaultValue={vehicle?.id} errors={errors} hint="Huruf kecil, dipakai di link." />
        <SelectField
          name="seatClass"
          label="Kelompok kursi"
          options={seatClasses.map((value) => ({ value, label: seatClassLabels[value] }))}
          defaultValue={vehicle?.seatClass ?? "seven"}
          errors={errors}
          hint="Tamu melihat harga per kelompok."
        />
        <TextField name="seats" label="Jumlah kursi (yang ditampilkan)" placeholder="7 atau 10–12" defaultValue={vehicle?.seats} errors={errors} />
        <TextField
          name="maxPassengers"
          label="Maksimal orang, tanpa bagasi besar"
          inputMode="numeric"
          defaultValue={vehicle?.maxPassengers}
          errors={errors}
          hint="Dewasa dan anak. Bayi yang dipangku tidak dihitung."
        />
        <TextField
          name="maxPassengersWithLuggage"
          label="Maksimal orang dengan bagasi"
          inputMode="numeric"
          defaultValue={vehicle?.maxPassengersWithLuggage}
          errors={errors}
          hint="Kalau membawa koper atau tas besar."
        />
        <TextField
          name="tourPricePercent"
          label="Level harga paket (%)"
          inputMode="numeric"
          placeholder="100"
          defaultValue={vehicle?.tourPricePercent ?? 100}
          errors={errors}
          hint="100 = harga yang tertulis di setiap paket. 150 = satu setengah kali harga itu untuk mobil ini."
        />
        <TextField name="dayWithDriverIdr" label="Tarif harian dengan sopir" inputMode="numeric" defaultValue={vehicle?.dayWithDriverIdr} errors={errors} />
        <TextField
          name="dayWithDriverAndFuelIdr"
          label="Tarif harian dengan sopir dan BBM"
          inputMode="numeric"
          defaultValue={vehicle?.dayWithDriverAndFuelIdr}
          errors={errors}
        />
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
          <TextField name="transferRate.baseIdr" label="Biaya awal" inputMode="numeric" defaultValue={vehicle?.transferRate?.baseIdr} errors={errors} />
          <TextField name="transferRate.perKmIdr" label="Per km" inputMode="numeric" defaultValue={vehicle?.transferRate?.perKmIdr} errors={errors} />
          <TextField
            name="transferRate.minimumIdr"
            label="Harga terendah"
            inputMode="numeric"
            defaultValue={vehicle?.transferRate?.minimumIdr}
            errors={errors}
            hint="Untuk perjalanan pendek."
          />
          <p className="text-xs text-muted-foreground sm:col-span-3">
            Harga antar jemput = biaya awal + per km × jarak, tidak pernah di bawah harga terendah, dibulatkan ke atas ke Rp 5.000 terdekat.
          </p>
        </div>
      ) : null}

      <SwitchField name="published" label="Tampilkan di website" defaultChecked={vehicle?.published ?? true} />
    </RecordDialog>
  );
}
