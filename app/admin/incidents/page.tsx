"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDateTime, vehicleLabel } from "lib/utils";

export default function IncidentsPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  return (
    <AdminShell title={t.admin.incidents}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.incidents}</h1>
      <DataTable
        headers={[t.table.vehicle, t.table.note, t.table.severity, t.table.status, t.table.dates]}
        rows={state.incidents.map((item) => [
          vehicleLabel(state.vehicles.find((v) => v.id === item.vehicleId)),
          item.title,
          item.severity,
          <StatusPill key={item.id} label={t.status[item.status]} tone={item.status === "open" ? "bg-rose-50 text-rose-700" : "bg-zinc-100 text-zinc-600"} />,
          formatDateTime(item.at, locale),
        ])}
      />
    </AdminShell>
  );
}
