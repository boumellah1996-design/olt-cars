"use client";

import Link from "next/link";
import { Fuel, Gauge } from "lucide-react";
import { useI18n } from "lib/i18n";
import type { Vehicle } from "lib/types";
import { formatDA } from "lib/utils";

export function VehicleCard({
  vehicle,
  startAt,
  endAt,
  pickupType,
  location,
}: {
  vehicle: Vehicle;
  startAt?: string;
  endAt?: string;
  pickupType?: string;
  location?: string;
}) {
  const { t, locale } = useI18n();
  const query = new URLSearchParams({
    start: startAt || "",
    end: endAt || "",
    type: pickupType || "agency",
    location: location || "",
  }).toString();

  const bookable = vehicle.status === "available";

  return (
    <article className="overflow-hidden rounded-[28px] bg-zinc-950 text-white shadow-soft">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="mt-2 text-sm text-zinc-400">{vehicle.category}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-900">
                <Gauge size={12} className="me-1 inline" />
                {t.transmission[vehicle.transmission]}
              </span>
              <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-medium text-zinc-900">
                <Fuel size={12} className="me-1 inline" />
                {t.fuel[vehicle.fuel]}
              </span>
            </div>
          </div>
          <p className="mt-6 text-xs text-zinc-400">
            {startAt && endAt ? `${vehicle.seats} ${t.catalog.seats} · ${vehicle.year}` : t.catalog.chooseDates}
          </p>
        </div>
        <div className="relative min-h-[200px]">
          <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
        <div>
          <p className="text-xl font-bold">{formatDA(vehicle.pricePerDay, locale)}</p>
          <p className="text-xs text-zinc-400">{t.catalog.perDay}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/vehicles/${vehicle.id}?${query}`}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          >
            {t.catalog.details}
          </Link>
          <Link
            href={bookable ? `/booking?vehicle=${vehicle.id}&${query}` : `/vehicles/${vehicle.id}`}
            className="btn-cta px-4 py-2 text-sm"
          >
            {bookable ? t.catalog.book : t.catalog.unavailable}
          </Link>
        </div>
      </div>
    </article>
  );
}
