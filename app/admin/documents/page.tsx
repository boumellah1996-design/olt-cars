"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDate, vehicleLabel } from "lib/utils";

export default function DocumentsPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  return (
    <AdminShell title={t.admin.documents}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.documents}</h1>
      <DataTable
        headers={[t.table.vehicle, t.table.type, t.table.note, t.table.expires]}
        rows={state.documents.map((item) => [
          vehicleLabel(state.vehicles.find((v) => v.id === item.vehicleId)),
          item.type,
          item.name,
          item.expiresAt ? formatDate(item.expiresAt, locale) : "—",
        ])}
      />
    </AdminShell>
  );
}
