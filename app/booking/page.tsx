"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageBackRow } from "@/components/frontend/BackButton";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import type { PickupType } from "lib/types";
import { daysBetween, formatDA } from "lib/utils";

function BookingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { state, createReservation } = useStore();
  const vehicle = state.vehicles.find((item) => item.id === params.get("vehicle"));
  const startAt = params.get("start") || "";
  const endAt = params.get("end") || "";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<string | null>(null);

  if (!vehicle) {
    return (
      <PublicLayout hideBack>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <PageBackRow />
          {t.catalog.empty}
        </div>
      </PublicLayout>
    );
  }

  const days = startAt && endAt ? daysBetween(startAt, endAt) : 1;
  const total = vehicle.pricePerDay * days;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const reservation = createReservation({
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      vehicleId: vehicle!.id,
      pickupType: (params.get("type") as PickupType) || "agency",
      location: params.get("location") || "Agence Principale",
      startAt: startAt || new Date().toISOString(),
      endAt: endAt || new Date(Date.now() + 86400000).toISOString(),
    });
    setDone(reservation.code);
  }

  return (
    <PublicLayout hideBack>
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="rounded-[28px] bg-white p-8 shadow-card dark:bg-zinc-900">
          <PageBackRow />
          <h1 className="text-3xl font-black">{t.booking.title}</h1>
          <p className="mt-2 text-zinc-500">
            {vehicle.brand} {vehicle.model} · {formatDA(total, locale)}
          </p>

          {done ? (
            <div className="mt-8 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800">
              <p className="text-lg font-semibold">{t.booking.success}</p>
              <p className="mt-2 text-sm text-zinc-500">{t.booking.code}</p>
              <p className="mt-1 text-2xl font-black">{done}</p>
              <button
                type="button"
                onClick={() => router.push(`/follow?code=${done}`)}
                className="btn-cta mt-6 px-5 py-2 text-sm"
              >
                {t.nav.follow}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 grid gap-4">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.booking.name} className="h-12 rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950" />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.booking.phone} className="h-12 rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.booking.email} className="h-12 rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950" />
              <button type="submit" className="h-12 rounded-full bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                {t.booking.confirm}
              </button>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  );
}
