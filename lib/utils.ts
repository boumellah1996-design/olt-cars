import { clsx, type ClassValue } from "clsx";
import type { Locale, Rental, Vehicle } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const localeTags: Record<Locale, string> = {
  ar: "ar-DZ",
  fr: "fr-DZ",
  en: "en-DZ",
  es: "es-DZ",
};

export function formatDA(value: number, locale: Locale = "fr") {
  const formatted = new Intl.NumberFormat(localeTags[locale] || "fr-DZ").format(value);
  return locale === "ar" ? `${formatted} دج` : `${formatted} DA`;
}

export function formatDate(value: string, locale: Locale = "fr") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeTags[locale] || "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string, locale: Locale = "fr") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeTags[locale] || "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function daysBetween(startAt: string, endAt: string) {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (!start || !end || end <= start) return 1;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function nextCode(prefix: string, existing: string[]) {
  const nums = existing
    .map((code) => Number(code.split("-").pop()))
    .filter((n) => Number.isFinite(n));
  const next = String((Math.max(0, ...nums) || 0) + 1).padStart(6, "0");
  return `${prefix}-${new Date().getFullYear()}-${next}`;
}

export function vehicleLabel(vehicle?: Vehicle) {
  if (!vehicle) return "—";
  return `${vehicle.brand} ${vehicle.model}`;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

export function isLate(rental: Rental, now = new Date()) {
  return rental.status !== "completed" && new Date(rental.endAt) < now;
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function sameDay(value: string, day = todayIsoDate()) {
  return value.slice(0, 10) === day;
}
