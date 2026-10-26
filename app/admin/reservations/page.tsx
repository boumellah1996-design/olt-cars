"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDateTime, vehicleLabel } from "lib/utils";

export default function ReservationsPage() {
  const { t, locale } = useI18n();
  const { state, confirmReservation, cancelReservation, convertReservation } = useStore();

  const tone: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-sky-50 text-sky-700",
    cancelled: "bg-zinc-100 text-zinc-600",
    converted: "bg-emerald-50 text-emerald-700",
  };

  return (
    <AdminShell title={t.admin.reservations}>
      <h1 className="mb-5 text-2xl font-black">{t.admin.reservations}</h1>
      <DataTable
        headers={[t.table.code, t.table.client, t.table.vehicle, t.table.dates, t.table.amount, t.table.status, t.table.actions]}
        rows={state.reservations.map((item) => [
          item.code,
          <div key={`${item.id}-c`}>
            <p>{item.clientName}</p>
            <p className="text-xs text-zinc-400">{item.clientPhone}</p>
          </div>,
          vehicleLabel(state.vehicles.find((v) => v.id === item.vehicleId)),
          `${formatDateTime(item.startAt, locale)} → ${formatDateTime(item.endAt, locale)}`,
          formatDA(item.total, locale),
          <StatusPill key={`${item.id}-s`} label={t.status[item.status]} tone={tone[item.status]} />,
          <div key={`${item.id}-a`} className="flex flex-wrap gap-2">
            {item.status === "pending" && (
              <button type="button" onClick={() => confirmReservation(item.id)} className="text-xs font-semibold text-sky-600">
                {t.actions.confirm}
              </button>
            )}
            {(item.status === "pending" || item.status === "confirmed") && (
              <button type="button" onClick={() => convertReservation(item.id)} className="text-xs font-semibold text-emerald-600">
                {t.actions.convert}
              </button>
            )}
            {item.status !== "cancelled" && item.status !== "converted" && (
              <button type="button" onClick={() => cancelReservation(item.id)} className="text-xs font-semibold text-rose-500">
                {t.actions.cancel}
              </button>
            )}
          </div>,
        ])}
      />
    </AdminShell>
  );
}
