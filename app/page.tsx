"use client";

import { HeroSearch } from "@/components/frontend/HeroSearch";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { VehicleGrid } from "@/components/frontend/VehicleGrid";
import { HERO_IMAGE } from "lib/data";

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-zinc-950">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pb-20 sm:pt-20">
          <HeroSearch />
        </div>
      </section>
      <VehicleGrid />
    </PublicLayout>
  );
}
