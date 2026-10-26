"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";

const positions: Record<string, { top: string; left: string; city: string }> = {
  "v-arkana": { top: "42%", left: "48%", city: "Hydra, Alger" },
  "v-tucson": { top: "38%", left: "22%", city: "Oran" },
  "v-208": { top: "48%", left: "52%", city: "Alger Centre" },
  "v-cclass": { top: "40%", left: "50%", city: "Agence Principale" },
  "v-duster": { top: "55%", left: "47%", city: "Atelier, Alger" },
  "v-golf": { top: "34%", left: "28%", city: "Mostaganem" },
  "v-corolla": { top: "44%", left: "54%", city: "Bab Ezzouar" },
  "v-x3": { top: "46%", left: "49%", city: "Hydra" },
};

export default function GpsPage() {
  const { t } = useI18n();
  const { state } = useStore();

  return (
    <AdminShell title={t.admin.gps}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.gps}</h1>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="relative h-[520px] overflow-hidden rounded-2xl bg-[#dbe7d3] shadow-soft">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:40px_40px]" />
          {state.vehicles.map((vehicle) => {
            const pos = positions[vehicle.id] || { top: "50%", left: "50%", city: "Alger" };
            return (
              <div
                key={vehicle.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow"
                style={{ top: pos.top, left: pos.left }}
                title={`${vehicle.brand} ${vehicle.model} · ${pos.city}`}
              >
                {vehicle.brand[0]}
              </div>
            );
          })}
        </div>
        <div className="space-y-3">
          {state.vehicles.map((vehicle) => {
            const pos = positions[vehicle.id] || { city: "Alger" };
            return (
              <div key={vehicle.id} className="rounded-2xl bg-white p-4 shadow-soft dark:bg-zinc-900">
                <p className="font-semibold">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-zinc-500">{pos.city}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">{t.status[vehicle.status]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
