"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Building2, CalendarDays, MapPin, Plane, Search, Truck } from "lucide-react";
import { AGENCIES, AIRPORTS } from "lib/data";
import { useI18n } from "lib/i18n";
import type { Locale, PickupType } from "lib/types";
import { cn } from "lib/utils";

function placeLabel(
  item: { labelAr: string; labelFr: string; labelEn: string; labelEs: string },
  locale: Locale,
) {
  if (locale === "ar") return item.labelAr;
  if (locale === "en") return item.labelEn;
  if (locale === "es") return item.labelEs;
  return item.labelFr;
}

const deliveryOptions: Record<Locale, string[]> = {
  ar: ["التوصيل إلى المنزل — الجزائر العاصمة", "التوصيل إلى الفندق"],
  fr: ["Livraison à domicile — Alger", "Livraison hôtel"],
  en: ["Home delivery — Algiers", "Hotel delivery"],
  es: ["Entrega a domicilio — Argel", "Entrega en hotel"],
};

export function HeroSearch({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pickupType, setPickupType] = useState<PickupType>("agency");
  const [location, setLocation] = useState(AGENCIES[0].labelFr);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const options = useMemo(() => {
    if (pickupType === "airport") return AIRPORTS.map((item) => placeLabel(item, locale));
    if (pickupType === "delivery") return deliveryOptions[locale];
    return AGENCIES.map((item) => placeLabel(item, locale));
  }, [pickupType, locale]);

  function onTab(next: PickupType) {
    setPickupType(next);
    if (next === "agency") setLocation(placeLabel(AGENCIES[0], locale));
    if (next === "airport") setLocation(placeLabel(AIRPORTS[0], locale));
    if (next === "delivery") setLocation(deliveryOptions[locale][0]);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({
      type: pickupType,
      location,
      start: startAt,
      end: endAt,
    });
    router.push(`/vehicles?${params.toString()}`);
  }

  const tabs: { id: PickupType; label: string; icon: typeof Plane }[] = [
    { id: "airport", label: t.hero.airport, icon: Plane },
    { id: "agency", label: t.hero.agency, icon: Building2 },
    { id: "delivery", label: t.hero.delivery, icon: Truck },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "rounded-[28px] bg-white p-4 shadow-card dark:bg-zinc-900 sm:p-5",
        compact ? "mx-auto max-w-6xl" : "mx-auto max-w-5xl",
      )}
    >
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pickupType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400",
              )}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        {pickupType === "airport" ? t.hero.airportNote : pickupType === "delivery" ? t.hero.deliveryNote : t.hero.hint}
      </p>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <MapPin size={12} /> {t.hero.pickupReturn}
          </span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <CalendarDays size={12} /> {t.hero.start}
          </span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="h-12 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <CalendarDays size={12} /> {t.hero.end}
          </span>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="h-12 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <button
          type="submit"
          className="btn-cta mt-6 flex h-12 items-center justify-center gap-2 px-6 text-sm"
        >
          <Search size={16} />
          {t.hero.search}
        </button>
      </div>
    </form>
  );
}
