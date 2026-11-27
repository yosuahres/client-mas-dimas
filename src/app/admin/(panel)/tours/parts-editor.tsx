"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CarPricesField, type PriceCar } from "@/app/admin/(panel)/tours/car-prices-field";
import type { FieldErrors } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CarPrices } from "@/lib/content/schema";

type Row = { key: number; name: string; prices: CarPrices };

type PartsEditorProps = {
  /** The Indonesian names, in order. */
  names: string[];
  prices: CarPrices[];
  cars: PriceCar[];
  errors: FieldErrors;
};

// Split options of a package ("Borobudur saja" for "Borobudur & Prambanan"): one block per option, its Indonesian
// name and its price in each car. English and French names are translated on save, and can be corrected on their
// tabs. Each block sends its key in partKeys[] so its prices stay with its name when another block is removed.
export function PartsEditor({ names, prices, cars, errors }: PartsEditorProps) {
  const [rows, setRows] = useState<Row[]>(() => names.map((name, index) => ({ key: index, name, prices: prices[index] ?? {} })));
  const [nextKey, setNextKey] = useState(names.length);

  const addRow = () => {
    setRows((current) => [...current, { key: nextKey, name: "", prices: {} }]);
    setNextKey((key) => key + 1);
  };

  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium">
        Pilihan sebagian paket <span className="font-normal text-muted-foreground">(opsional)</span>
      </p>
      {rows.length > 0 ? (
        <ul className="grid gap-3">
          {rows.map((row, index) => (
            <li key={row.key} className="grid gap-2 rounded-lg border p-3">
              <input type="hidden" name="partKeys[]" value={row.key} />
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <Input
                  name="text.id.parts[]"
                  aria-label={`Nama pilihan ${index + 1} (bahasa Indonesia)`}
                  placeholder="Borobudur saja"
                  defaultValue={row.name}
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
              <CarPricesField cars={cars} name={`partPrices.${row.key}`} defaultValues={row.prices} errors={errors} />
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addRow}>
        <Plus />
        Tambah pilihan
      </Button>
    </div>
  );
}
