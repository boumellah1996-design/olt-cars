"use client";

import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { removeFromFleet, useFleet } from "lib/fleet";
import { useI18n } from "lib/i18n";
import { formatDA } from "lib/utils";

export default function AdminVehiclesPage() {
  const { t, locale } = useI18n();
  const { vehicles } = useFleet();
  const tone: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700",
    rented: "bg-violet-50 text-violet-700",
    reserved: "bg-sky-50 text-sky-700",
    maintenance: "bg-amber-50 text-amber-700",
    unavailable: "bg-zinc-100 text-zinc-600",
  };

  function onDelete(id: string, label: string) {
    if (!window.confirm(`${t.actions.deleteConfirm}\n${label}`)) return;
    removeFromFleet(id);
  }

  return (
    <AdminShell title={t.admin.vehicles}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.vehicles}</h1>
      <DataTable
        headers={[t.table.vehicle, t.table.plate, t.table.category, t.table.price, t.table.price7Days, t.table.status, t.table.actions]}
        rows={vehicles.map((item) => [
          `${item.brand} ${item.model}`,
          item.plate,
          item.category,
          formatDA(item.pricePerDay, locale),
          item.price7Days ? formatDA(item.price7Days, locale) : "—",
          <StatusPill key={item.id} label={t.status[item.status]} tone={tone[item.status]} />,
          <button
            key={`${item.id}-delete`}
            type="button"
            onClick={() => onDelete(item.id, `${item.brand} ${item.model}`)}
            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
          >
            <Trash2 size={14} />
            {t.actions.delete}
          </button>,
        ])}
      />
    </AdminShell>
  );
}
