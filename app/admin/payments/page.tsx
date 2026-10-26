"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDateTime } from "lib/utils";

export default function PaymentsPage() {
  const { t, locale } = useI18n();
  const { state, kpis } = useStore();
  return (
    <AdminShell title={t.admin.payments}>
      <div className="mb-5 flex items-end justify-between">
        <h1 className="text-2xl font-black">{t.admin.payments}</h1>
        <p className="text-sm text-rose-500">
          {t.admin.unpaid}: {formatDA(kpis.unpaid, locale)}
        </p>
      </div>
      <DataTable
        headers={[t.table.client, t.table.amount, t.table.method, t.table.note, t.table.dates]}
        rows={state.payments.map((item) => [
          item.clientName,
          formatDA(item.amount, locale),
          item.method,
          item.note || "—",
          formatDateTime(item.at, locale),
        ])}
      />
    </AdminShell>
  );
}
