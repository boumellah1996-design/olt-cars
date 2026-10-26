"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDate, vehicleLabel } from "lib/utils";

export default function MaintenancePage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  return (
    <AdminShell title={t.admin.maintenance}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.maintenance}</h1>
      <DataTable
        headers={[t.table.vehicle, t.table.type, t.table.amount, t.table.status, t.table.note]}
        rows={state.maintenances.map((item) => [
          vehicleLabel(state.vehicles.find((v) => v.id === item.vehicleId)),
          item.type,
          formatDA(item.cost, locale),
          <StatusPill key={item.id} label={t.status[item.status]} tone={item.status === "open" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />,
          `${item.note} · ${formatDate(item.startAt, locale)}`,
        ])}
      />
    </AdminShell>
  );
}
