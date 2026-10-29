"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Fuel, Gauge, Users } from "lucide-react";
import { PageBackRow } from "@/components/frontend/BackButton";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { useFleet } from "lib/fleet";
import { useI18n } from "lib/i18n";
import type { Vehicle } from "lib/types";
import { formatDA } from "lib/utils";

export function VehicleDetailClient({ initialVehicle }: { initialVehicle: Vehicle | null }) {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { vehicles, ready } = useFleet();
  const { t, locale } = useI18n();
  const vehicle = vehicles.find((item) => item.id === id) ?? (!ready ? initialVehicle : null);

  if (!ready && !vehicle) {
    return (
      <PublicLayout hideBack>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <PageBackRow />
        </div>
      </PublicLayout>
    );
  }

  if (!vehicle) {
    return (
      <PublicLayout hideBack>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <PageBackRow />
          <div className="text-center">{t.catalog.empty}</div>
        </div>
      </PublicLayout>
    );
  }

  const query = params.toString();

  return (
    <PublicLayout hideBack>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PageBackRow />
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="h-[420px] w-full rounded-[28px] object-cover" />
            {vehicle.images && vehicle.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {vehicle.images.map((src, index) => (
                  <img
                    key={`${vehicle.id}-img-${index}`}
                    src={src}
                    alt=""
                    className="h-20 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>
          <div className="rounded-[28px] bg-white p-8 shadow-soft dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">{vehicle.category}</p>
            <h1 className="mt-1 text-4xl font-black">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-4 text-3xl font-bold">{formatDA(vehicle.pricePerDay, locale)}</p>
            <p className="text-sm text-zinc-500">{t.catalog.perDay}</p>
            {vehicle.price7Days ? (
              <p className="mt-2 text-lg font-semibold">
                {formatDA(vehicle.price7Days, locale)}{" "}
                <span className="text-sm font-medium text-zinc-500">{t.table.price7Days}</span>
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                <Gauge size={14} className="me-1 inline" /> {t.transmission[vehicle.transmission]}
              </span>
              <span className="rounded-full bg-brand-yellow px-4 py-2 text-sm">
                <Fuel size={14} className="me-1 inline" /> {t.fuel[vehicle.fuel]}
              </span>
              <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                <Users size={14} className="me-1 inline" /> {vehicle.seats} {t.catalog.seats}
              </span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">{t.table.plate}</p>
                <p className="font-semibold">{vehicle.plate}</p>
              </div>
              <div>
                <p className="text-zinc-500">{t.catalog.year}</p>
                <p className="font-semibold">{vehicle.year}</p>
              </div>
            </div>
            <Link
              href={`/booking?vehicle=${vehicle.id}&${query}`}
              className="mt-8 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
            >
              {t.catalog.book}
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
