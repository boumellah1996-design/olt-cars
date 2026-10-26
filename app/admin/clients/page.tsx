"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDate } from "lib/utils";

export default function ClientsPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  return (
    <AdminShell title={t.admin.clients}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.clients}</h1>
      <DataTable
        headers={[t.table.client, t.booking.email, t.table.phone, "Permis", t.table.dates]}
        rows={state.clients.map((item) => [item.name, item.email, item.phone, item.license, formatDate(item.createdAt, locale)])}
      />
    </AdminShell>
  );
}
