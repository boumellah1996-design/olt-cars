"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA } from "lib/utils";

export default function AdminVehiclesPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const tone: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700",
    rented: "bg-violet-50 text-violet-700",
    reserved: "bg-sky-50 text-sky-700",
    maintenance: "bg-amber-50 text-amber-700",
    unavailable: "bg-zinc-100 text-zinc-600",
  };

  return (
    <AdminShell title={t.admin.vehicles}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.vehicles}</h1>
      <DataTable
        headers={[t.table.vehicle, t.table.plate, t.table.category, t.table.price, t.table.price7Days, t.table.status]}
        rows={state.vehicles.map((item) => [
          `${item.brand} ${item.model}`,
          item.plate,
          item.category,
          formatDA(item.pricePerDay, locale),
          item.price7Days ? formatDA(item.price7Days, locale) : "—",
          <StatusPill key={item.id} label={t.status[item.status]} tone={tone[item.status]} />,
        ])}
      />
    </AdminShell>
  );
}
