"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  CalendarClock,
  Car,
  Clock3,
  DollarSign,
  Wrench,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDate, formatTime } from "lib/utils";

function Kpi({
  label,
  value,
  icon,
  tone = "zinc",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "zinc" | "amber" | "blue" | "rose" | "pink";
}) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800",
    amber: "bg-amber-50 text-amber-500",
    blue: "bg-sky-50 text-sky-500",
    rose: "bg-rose-50 text-rose-500",
    pink: "bg-pink-50 text-pink-500",
  };
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const { kpis, state } = useStore();

  const fleetRows = [
    { label: t.admin.fleetAvailable, value: kpis.available, color: "bg-emerald-500" },
    { label: t.admin.fleetRented, value: kpis.rented, color: "bg-violet-500" },
    { label: t.admin.fleetReserved, value: kpis.reserved, color: "bg-sky-500" },
    { label: t.admin.fleetMaint, value: kpis.maintenance, color: "bg-amber-400" },
    { label: t.admin.fleetDown, value: kpis.unavailable, color: "bg-zinc-400" },
  ];

  return (
    <AdminShell title={t.admin.overview}>
      <div className="mb-6">
        <h1 className="text-3xl font-black">{t.admin.overview}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t.admin.overviewSub}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label={t.admin.available} value={`${kpis.available}/${kpis.totalVehicles}`} icon={<Car size={16} />} />
        <Kpi label={t.admin.reserved} value={String(kpis.reserved)} icon={<Clock3 size={16} />} tone="amber" />
        <Kpi label={t.admin.rented} value={String(kpis.rented)} icon={<ArrowLeftRight size={16} />} tone="blue" />
        <Kpi label={t.admin.maintenanceKpi} value={String(kpis.maintenance)} icon={<Wrench size={16} />} tone="pink" />
        <Kpi label={t.admin.departures} value={String(kpis.departures)} icon={<ArrowLeftRight size={16} />} />
        <Kpi label={t.admin.returns} value={String(kpis.returns)} icon={<Clock3 size={16} />} />
        <Kpi label={t.admin.newRes} value={String(kpis.newRes)} icon={<CalendarClock size={16} />} />
        <Kpi label={t.admin.pending} value={String(kpis.pendingCount)} icon={<Clock3 size={16} />} tone="amber" />
        <Kpi label={t.admin.caToday} value={formatDA(kpis.caToday, locale)} icon={<DollarSign size={16} />} />
        <Kpi label={t.admin.caMonth} value={formatDA(kpis.caMonth, locale)} icon={<DollarSign size={16} />} />
        <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <p className="text-sm text-zinc-500">{t.admin.unpaid}</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-rose-500">{formatDA(kpis.unpaid, locale)}</p>
        </div>
        <Link href="/admin/payments" className="flex items-center justify-center rounded-2xl bg-white p-4 text-sm font-medium shadow-soft dark:bg-zinc-900">
          {t.admin.details}
        </Link>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl bg-white p-5 shadow-soft dark:bg-zinc-900">
          <h2 className="text-lg font-bold">{t.admin.journal}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t.admin.journalSub}</p>
          <div className="mt-5 space-y-4">
            {state.activities.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                  <div>
                    <p className="text-sm font-medium">{locale === "ar" ? item.messageAr : item.messageFr}</p>
                    <p className="text-xs text-zinc-500">{locale === "ar" ? item.detailAr : item.detailFr}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">{formatTime(item.at)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-soft dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-500">!</span>
              <h2 className="text-lg font-bold">{t.admin.alerts}</h2>
            </div>
            <div className="space-y-3">
              {kpis.late.map((rental) => (
                <div key={rental.id} className="rounded-xl bg-rose-50 px-4 py-3 text-sm dark:bg-rose-500/10">
                  <p className="font-medium text-rose-600">
                    {t.admin.lateReturn} · {rental.code}
                  </p>
                  <p className="text-rose-500/80">
                    {t.admin.shouldReturn} {formatDate(rental.endAt, locale)}
                  </p>
                </div>
              ))}
              {kpis.pendingCount > 0 && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm dark:bg-amber-500/10">
                  <p className="font-medium text-amber-700">{t.admin.pendingAlert}</p>
                  <p className="text-amber-700/80">
                    {kpis.pendingCount} {t.admin.pendingNeed}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-soft dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold">{t.admin.fleetState}</h2>
            <div className="space-y-3">
              {fleetRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-sm ${row.color}`} />
                      {row.label}
                    </span>
                    <span className="text-zinc-500">
                      {row.value} {t.admin.veh}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-full ${row.color}`}
                      style={{ width: `${kpis.totalVehicles ? (row.value / kpis.totalVehicles) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
