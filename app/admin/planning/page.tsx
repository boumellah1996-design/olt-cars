"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDate, vehicleLabel } from "lib/utils";

export default function PlanningPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const items = [
    ...state.reservations.filter((r) => r.status !== "cancelled").map((r) => ({ ...r, kind: t.admin.reservations })),
    ...state.rentals.filter((r) => r.status !== "completed").map((r) => ({ ...r, kind: t.admin.rentals })),
  ].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

  return (
    <AdminShell title={t.admin.planning}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.planning}</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-soft dark:bg-zinc-900">
            <div>
              <p className="text-sm font-semibold">{item.code}</p>
              <p className="text-xs text-zinc-500">
                {item.clientName} · {vehicleLabel(state.vehicles.find((v) => v.id === item.vehicleId))}
              </p>
            </div>
            <div className="text-end text-sm">
              <p>{item.kind}</p>
              <p className="text-zinc-500">
                {formatDate(item.startAt, locale)} → {formatDate(item.endAt, locale)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
