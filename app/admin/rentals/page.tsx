"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDateTime, vehicleLabel } from "lib/utils";

export default function RentalsPage() {
  const { t, locale } = useI18n();
  const { state, completeRental, addPayment } = useStore();
  const tone: Record<string, string> = {
    active: "bg-sky-50 text-sky-700",
    late: "bg-rose-50 text-rose-700",
    completed: "bg-zinc-100 text-zinc-600",
  };

  return (
    <AdminShell title={t.admin.rentals}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.rentals}</h1>
      <DataTable
        headers={[t.table.code, t.table.client, t.table.vehicle, t.table.dates, t.table.amount, t.table.status, t.table.actions]}
        rows={state.rentals.map((item) => [
          item.code,
          item.clientName,
          vehicleLabel(state.vehicles.find((v) => v.id === item.vehicleId)),
          `${formatDateTime(item.startAt, locale)} → ${formatDateTime(item.endAt, locale)}`,
          `${formatDA(item.paid, locale)} / ${formatDA(item.total, locale)}`,
          <StatusPill key={`${item.id}-s`} label={t.status[item.status]} tone={tone[item.status]} />,
          <div key={`${item.id}-a`} className="flex gap-2">
            {item.paid < item.total && (
              <button
                type="button"
                onClick={() =>
                  addPayment({
                    rentalId: item.id,
                    clientName: item.clientName,
                    amount: item.total - item.paid,
                    method: "cash",
                    at: new Date().toISOString(),
                    note: item.code,
                  })
                }
                className="text-xs font-semibold text-emerald-600"
              >
                {t.actions.pay}
              </button>
            )}
            {item.status !== "completed" && (
              <button type="button" onClick={() => completeRental(item.id)} className="text-xs font-semibold text-zinc-700">
                {t.actions.complete}
              </button>
            )}
          </div>,
        ])}
      />
    </AdminShell>
  );
}
