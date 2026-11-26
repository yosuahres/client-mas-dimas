"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { FieldErrors } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = { key: number; name: string; price: string };

type PartsEditorProps = {
  /** The Indonesian names, in order. */
  names: string[];
  prices: (number | null)[];
  errors: FieldErrors;
};

// Split options of a package ("Borobudur saja" for "Borobudur & Prambanan"): one row per option, its Indonesian
// name next to its price. English and French names are translated on save, and can be corrected on their tabs.
export function PartsEditor({ names, prices, errors }: PartsEditorProps) {
  const [rows, setRows] = useState<Row[]>(() =>
    names.map((name, index) => ({ key: index, name, price: prices[index] === null || prices[index] === undefined ? "" : String(prices[index]) })),
  );
  const [nextKey, setNextKey] = useState(names.length);

  const addRow = () => {
    setRows((current) => [...current, { key: nextKey, name: "", price: "" }]);
    setNextKey((key) => key + 1);
  };

  return (
    <div className="grid gap-2">
      <div>
        <p className="text-[13px] font-medium">
          Pilihan sebagian paket <span className="font-normal text-muted-foreground">(opsional)</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Bagian paket yang bisa dipesan terpisah, misalnya &quot;Borobudur saja&quot;. Lewati kalau paket ini hanya dijual utuh. Isi harga untuk mobil termurah; kosongkan untuk
          &quot;Hubungi kami&quot;. Mobil yang lebih besar mengikuti &quot;Harga paket tour untuk mobil ini&quot; di Mobil &amp; harga.
        </p>
      </div>
      {rows.length > 0 ? (
        <ul className="grid gap-2">
          {rows.map((row, index) => {
            const error = errors[`partPrices.${index}`];
            return (
              <li key={row.key} className="grid gap-1">
                {/* On phones the name gets its own line and the price sits under it, next to the remove button. */}
                <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_9rem_auto]">
                  <Input
                    className="col-span-2 sm:col-span-1"
                    name="text.id.parts[]"
                    aria-label={`Nama pilihan ${index + 1} (bahasa Indonesia)`}
                    placeholder="Borobudur saja"
                    defaultValue={row.name}
                  />
                  <Input
                    name="partPrices[]"
                    aria-label={`Harga pilihan ${index + 1} (Rp)`}
                    inputMode="numeric"
                    placeholder="Rp, atau kosong"
                    defaultValue={row.price}
                    aria-invalid={error ? true : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus pilihan ${index + 1}`}
                    onClick={() => setRows((current) => current.filter((candidate) => candidate.key !== row.key))}
                  >
                    <Trash2 />
                  </Button>
                </div>
                {error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {error}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addRow}>
        <Plus />
        Tambah pilihan
      </Button>
    </div>
  );
}
