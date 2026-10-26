"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDateTime } from "lib/utils";

export default function ExpensesPage() {
  const { t, locale } = useI18n();
  const { state } = useStore();
  return (
    <AdminShell title={t.admin.expenses}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.expenses}</h1>
      <DataTable
        headers={[t.table.category, t.table.amount, t.table.note, t.table.dates]}
        rows={state.expenses.map((item) => [item.category, formatDA(item.amount, locale), item.note, formatDateTime(item.at, locale)])}
      />
    </AdminShell>
  );
}
