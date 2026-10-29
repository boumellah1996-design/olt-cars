"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { HeroSearch } from "@/components/frontend/HeroSearch";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { VehicleGrid } from "@/components/frontend/VehicleGrid";
import { hydrateFleet } from "lib/fleet";
import type { Vehicle } from "lib/types";

function VehiclesContent({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const params = useSearchParams();
  useEffect(() => {
    hydrateFleet(initialVehicles);
  }, [initialVehicles]);
  return (
    <PublicLayout>
      <section className="bg-zinc-950 px-4 py-10">
        <HeroSearch compact />
      </section>
      <VehicleGrid
        initialVehicles={initialVehicles}
        startAt={params.get("start") || undefined}
        endAt={params.get("end") || undefined}
        pickupType={params.get("type") || undefined}
        location={params.get("location") || undefined}
      />
    </PublicLayout>
  );
}

export function VehiclesPageClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  return (
    <Suspense>
      <VehiclesContent initialVehicles={initialVehicles} />
    </Suspense>
  );
}
