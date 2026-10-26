"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDateTime } from "lib/utils";

export default function CashPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const balance = state.cash.reduce((sum, item) => sum + (item.type === "in" ? item.amount : -item.amount), 0);

  return (
    <AdminShell title={t.admin.cash}>
      <div className="mb-5 flex items-end justify-between">
        <h1 className="text-2xl font-black">{t.admin.cash}</h1>
        <p className="text-lg font-bold">{formatDA(balance, locale)}</p>
      </div>
      <DataTable
        headers={[t.table.type, t.table.amount, t.table.note, t.table.dates]}
        rows={state.cash.map((item) => [
          item.type === "in" ? "+" : "−",
          formatDA(item.amount, locale),
          item.note,
          formatDateTime(item.at, locale),
        ])}
      />
    </AdminShell>
  );
}
