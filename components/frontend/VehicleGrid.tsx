"use client";

import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/frontend/VehicleCard";
import { brandKey, useFleet } from "lib/fleet";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { overlaps } from "lib/utils";
import { cn } from "lib/utils";

export function VehicleGrid({
  startAt,
  endAt,
  pickupType,
  location,
}: {
  startAt?: string;
  endAt?: string;
  pickupType?: string;
  location?: string;
}) {
  const { t } = useI18n();
  const { state } = useStore();
  const { vehicles: fleet, ready } = useFleet();
  const [brand, setBrand] = useState("all");

  const brands = useMemo(() => {
    const unique = new Map<string, string>();
    for (const vehicle of fleet) {
      const key = brandKey(vehicle.brand);
      if (key && !unique.has(key)) unique.set(key, vehicle.brand.trim());
    }
    return Array.from(unique.values());
  }, [fleet]);

  const vehicles = useMemo(() => {
    return fleet.filter((vehicle) => {
      if (brand !== "all" && brandKey(vehicle.brand) !== brandKey(brand)) return false;
      if (startAt && endAt) {
        const busy = [...state.reservations, ...state.rentals].some((item) => {
          const active =
            item.status === "pending" ||
            item.status === "confirmed" ||
            item.status === "active" ||
            item.status === "late";
          return active && item.vehicleId === vehicle.id && overlaps(startAt, endAt, item.startAt, item.endAt);
        });
        if (busy) return false;
      }
      return true;
    });
  }, [fleet, state.reservations, state.rentals, brand, startAt, endAt]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">{t.catalog.title}</h2>
        <p className="mt-2 text-sm text-zinc-500">{ready ? t.catalog.subtitle(vehicles.length) : "…"}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setBrand("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              brand === "all" ? "bg-brand-yellow text-zinc-950" : "bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200",
            )}
          >
            {t.catalog.allBrands}
          </button>
          {brands.map((item) => (
            <button
              key={brandKey(item)}
              type="button"
              onClick={() => setBrand(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize",
                brandKey(brand) === brandKey(item)
                  ? "bg-brand-yellow text-zinc-950"
                  : "bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {!ready ? (
        <p className="mt-12 text-center text-zinc-500">…</p>
      ) : vehicles.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">{t.catalog.empty}</p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              startAt={startAt}
              endAt={endAt}
              pickupType={pickupType}
              location={location}
            />
          ))}
        </div>
      )}
    </section>
  );
}
