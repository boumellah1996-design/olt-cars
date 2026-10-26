"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { PageBackRow } from "@/components/frontend/BackButton";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { formatDA, formatDateTime, vehicleLabel } from "lib/utils";

function FollowContent() {
  const params = useSearchParams();
  const { t, locale } = useI18n();
  const { state } = useStore();
  const [code, setCode] = useState(params.get("code") || "");
  const [query, setQuery] = useState(params.get("code") || "");

  const reservation = useMemo(
    () => state.reservations.find((item) => item.code.toLowerCase() === query.trim().toLowerCase()),
    [state.reservations, query],
  );
  const rental = useMemo(
    () => state.rentals.find((item) => item.code.toLowerCase() === query.trim().toLowerCase()),
    [state.rentals, query],
  );
  const record = reservation || rental;
  const vehicle = state.vehicles.find((item) => item.id === record?.vehicleId);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setQuery(code);
  }

  return (
    <PublicLayout hideBack>
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-[28px] bg-white p-8 shadow-card dark:bg-zinc-900">
          <PageBackRow />
          <h1 className="text-3xl font-black">{t.follow.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">{t.follow.subtitle}</p>
          <form onSubmit={onSubmit} className="mt-6 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.follow.placeholder}
              className="h-12 flex-1 rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button type="submit" className="btn-cta h-12 px-5 text-sm">
              {t.follow.action}
            </button>
          </form>

          {query && !record && <p className="mt-6 text-sm text-rose-500">{t.follow.notFound}</p>}

          {record && (
            <div className="mt-8 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800">
              <p className="text-xl font-bold">{record.code}</p>
              <p className="mt-2 text-sm text-zinc-500">{record.clientName}</p>
              <p className="mt-1 font-medium">{vehicleLabel(vehicle)}</p>
              <p className="mt-3 text-sm">
                {formatDateTime(record.startAt, locale)} → {formatDateTime(record.endAt, locale)}
              </p>
              <p className="mt-2 text-sm font-semibold">{formatDA(record.total, locale)}</p>
              <p className="mt-4 inline-flex rounded-full bg-zinc-950 px-3 py-1 text-xs text-white dark:bg-white dark:text-zinc-950">
                {t.status[record.status]}
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export default function FollowPage() {
  return (
    <Suspense>
      <FollowContent />
    </Suspense>
  );
}
