"use client";

import type { FieldErrors } from "@/components/admin/form-fields";
import { seatClassLabels } from "@/components/admin/seat-class-labels";
import { Input } from "@/components/ui/input";
import { seatClasses, type CarPrices, type VehicleRecord } from "@/lib/content/schema";

export type PriceCar = Pick<VehicleRecord, "id" | "name" | "seatClass" | "published">;

type CarPricesFieldProps = {
  cars: PriceCar[];
  /** Field names are `${name}.${car id}`, e.g. "carPrices.avanza". */
  name: string;
  defaultValues: CarPrices;
  /** Called with the car id and what was typed, for a live preview. */
  onPriceChange?: (car: string, typed: string) => void;
  errors: FieldErrors;
};

// One fixed price per car, grouped by seat group as guests choose them. An empty box shows "Hubungi kami".
export function CarPricesField({ cars, name, defaultValues, onPriceChange, errors }: CarPricesFieldProps) {
  return (
    <div className="grid gap-3">
      {seatClasses.map((seatClass) => {
        const group = cars.filter((car) => car.seatClass === seatClass);
        if (group.length === 0) return null;
        return (
          <div key={seatClass} className="grid gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">{seatClassLabels[seatClass]}</p>
            <ul className="grid gap-2">
              {group.map((car) => {
                const field = `${name}.${car.id}`;
                const error = errors[field];
                return (
                  <li key={car.id} className="grid gap-1">
                    <div className="grid grid-cols-[1fr_9rem] items-center gap-2">
                      <label htmlFor={field} className="min-w-0 text-sm">
                        {car.name}
                        {car.published ? null : <span className="ml-1.5 text-xs text-muted-foreground">tidak tampil</span>}
                      </label>
                      <Input
                        id={field}
                        name={field}
                        inputMode="numeric"
                        placeholder="Hubungi kami"
                        defaultValue={Object.hasOwn(defaultValues, car.id) ? String(defaultValues[car.id]) : ""}
                        onChange={onPriceChange ? (event) => onPriceChange(car.id, event.target.value) : undefined}
                        aria-invalid={error ? true : undefined}
                      />
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
          </div>
        );
      })}
    </div>
  );
}
