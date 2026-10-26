"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HeroSearch } from "@/components/frontend/HeroSearch";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { VehicleGrid } from "@/components/frontend/VehicleGrid";

function VehiclesContent() {
  const params = useSearchParams();
  return (
    <PublicLayout>
      <section className="bg-zinc-950 px-4 py-10">
        <HeroSearch compact />
      </section>
      <VehicleGrid
        startAt={params.get("start") || undefined}
        endAt={params.get("end") || undefined}
        pickupType={params.get("type") || undefined}
        location={params.get("location") || undefined}
      />
    </PublicLayout>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehiclesContent />
    </Suspense>
  );
}
