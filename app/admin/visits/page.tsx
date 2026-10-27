"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { useI18n } from "lib/i18n";
import { formatDateTime } from "lib/utils";
import { isPrivateIp, type VisitLog } from "lib/visitor-log";

function geoLabel(value: string | undefined, ip: string, localLabel: string) {
  if (value) return value;
  if (isPrivateIp(ip)) return localLabel;
  return "—";
}

export default function VisitsPage() {
  const { t, locale } = useI18n();
  const [visits, setVisits] = useState<VisitLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/visits", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as VisitLog[];
        if (!cancelled && Array.isArray(data)) setVisits(data);
      } catch {
        // Keep the last successful snapshot if the poll fails.
      }
    }
    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <AdminShell title={t.admin.visits}>
      <h1 className="mb-1 text-2xl font-black">{t.admin.visits}</h1>
      <p className="mb-5 text-sm text-zinc-500">
        {t.admin.visitsSub} — {visits.length} {t.admin.visitsCount}
      </p>
      {visits.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-zinc-500 shadow-soft dark:bg-zinc-900">{t.admin.visitsEmpty}</p>
      ) : (
        <DataTable
          headers={[
            t.admin.visitsIp,
            t.admin.visitsCity,
            t.admin.visitsRegion,
            t.admin.visitsIsp,
            t.admin.visitsPage,
            t.admin.visitsTime,
          ]}
          rows={visits.map((item) => [
            item.ip,
            geoLabel(item.city, item.ip, t.admin.visitsLocal),
            geoLabel(item.region, item.ip, t.admin.visitsLocal),
            geoLabel(item.isp, item.ip, t.admin.visitsLocal),
            item.path,
            formatDateTime(item.timestamp, locale),
          ])}
        />
      )}
    </AdminShell>
  );
}
