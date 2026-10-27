"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "lib/i18n";
import type { Locale } from "lib/types";
import { cn } from "lib/utils";

const LOCALE_TAG: Record<Locale, string> = {
  ar: "ar-DZ",
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
};

const TIMES = Array.from({ length: 34 }, (_, index) => {
  const hour = 6 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

function todayYmd() {
  const now = new Date();
  return toYmd(now.getFullYear(), now.getMonth(), now.getDate());
}

function toYmd(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDatePart(value: string) {
  return value ? value.slice(0, 10) : "";
}

function parseTimePart(value: string) {
  const time = value.slice(11, 16);
  return time || "10:00";
}

function combine(date: string, time: string) {
  return date ? `${date}T${time}` : "";
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function monthCells(year: number, month: number) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatTrigger(value: string, locale: Locale, placeholder: string) {
  if (!value) return placeholder;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return placeholder;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function DateRangePicker({
  startAt,
  endAt,
  onChange,
}: {
  startAt: string;
  endAt: string;
  onChange: (startAt: string, endAt: string) => void;
}) {
  const { t, locale } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState("");
  const startDate = parseDatePart(startAt);
  const endDate = parseDatePart(endAt);
  const startTime = parseTimePart(startAt);
  const endTime = parseTimePart(endAt);
  const today = todayYmd();

  const initial = startDate || today;
  const [view, setView] = useState(() => ({
    year: Number(initial.slice(0, 4)),
    month: Number(initial.slice(5, 7)) - 1,
  }));

  const nextView = shiftMonth(view.year, view.month, 1);
  const minView = { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 };
  const canGoBack = view.year > minView.year || (view.year === minView.year && view.month > minView.month);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const previewEnd = useMemo(() => {
    if (startDate && !endDate && hovered && hovered >= startDate) return hovered;
    return endDate;
  }, [startDate, endDate, hovered]);

  function emit(nextStart: string, nextEnd: string, nextStartTime = startTime, nextEndTime = endTime) {
    onChange(combine(nextStart, nextStartTime), combine(nextEnd, nextEndTime));
  }

  function selectDay(ymd: string) {
    if (ymd < today) return;
    if (!startDate || (startDate && endDate) || ymd < startDate) {
      emit(ymd, "", startTime, endTime);
      setHovered("");
      return;
    }
    emit(startDate, ymd, startTime, endTime);
  }

  function openAt(field: "start" | "end") {
    setOpen(true);
    const anchor = field === "end" && endDate ? endDate : startDate || today;
    setView({ year: Number(anchor.slice(0, 4)), month: Number(anchor.slice(5, 7)) - 1 });
  }

  function dayState(ymd: string) {
    const isStart = Boolean(startDate && ymd === startDate);
    const isEnd = Boolean(previewEnd && ymd === previewEnd && startDate);
    const inRange = Boolean(startDate && previewEnd && ymd > startDate && ymd < previewEnd);
    return { isStart, isEnd, inRange, disabled: ymd < today };
  }

  function Month({ year, month }: { year: number; month: number }) {
    const title = new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: "long", year: "numeric" }).format(
      new Date(year, month, 1),
    );
    return (
      <div className="min-w-0 flex-1">
        <p className="mb-3 text-center text-sm font-semibold capitalize text-zinc-900 dark:text-white">{title}</p>
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium uppercase text-zinc-400">
          {t.hero.weekdays.map((day, index) => (
            <span key={`${day}-${index}`} className="py-1">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthCells(year, month).map((day, index) => {
            if (!day) return <div key={`empty-${year}-${month}-${index}`} className="h-10" />;
            const ymd = toYmd(year, month, day);
            const { isStart, isEnd, inRange, disabled } = dayState(ymd);
            return (
              <button
                key={ymd}
                type="button"
                disabled={disabled}
                onMouseEnter={() => setHovered(ymd)}
                onFocus={() => setHovered(ymd)}
                onClick={() => selectDay(ymd)}
                className={cn(
                  "relative h-10 text-sm transition",
                  disabled && "cursor-not-allowed text-zinc-300 dark:text-zinc-600",
                  !disabled && !isStart && !isEnd && !inRange && "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
                  inRange && "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white",
                  (isStart || isEnd) && "z-[1] bg-zinc-900 font-semibold text-white dark:bg-white dark:text-zinc-950",
                  isStart && isEnd && "rounded-lg",
                  isStart && !isEnd && "rounded-s-lg",
                  isEnd && !isStart && "rounded-e-lg",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <CalendarDays size={12} /> {t.hero.start}
          </span>
          <button
            type="button"
            onClick={() => openAt("start")}
            className={cn(
              "flex h-12 w-full items-center rounded-full border bg-white px-4 text-left text-sm dark:bg-zinc-950",
              open && !endDate ? "border-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-700",
              startAt ? "text-zinc-900 dark:text-white" : "text-zinc-400",
            )}
          >
            {formatTrigger(startAt, locale, t.hero.chooseDate)}
          </button>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <CalendarDays size={12} /> {t.hero.end}
          </span>
          <button
            type="button"
            onClick={() => openAt("end")}
            className={cn(
              "flex h-12 w-full items-center rounded-full border bg-white px-4 text-left text-sm dark:bg-zinc-950",
              open && startDate && !endDate ? "border-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-700",
              endAt ? "text-zinc-900 dark:text-white" : "text-zinc-400",
            )}
          >
            {formatTrigger(endAt, locale, t.hero.chooseDate)}
          </button>
        </label>
      </div>

      {open ? (
        <div className="absolute start-0 z-50 mt-2 w-[min(46rem,calc(100vw-2rem))] rounded-3xl border border-zinc-100 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900 sm:p-5 lg:start-auto lg:end-0">
          <div className="mb-4 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-b border-zinc-100 pb-3 text-sm dark:border-zinc-800">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">{t.hero.startShort}</span>
            <select
              value={startTime}
              onChange={(event) => emit(startDate, endDate, event.target.value, endTime)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-sky-400"
            >
              {TIMES.map((time) => (
                <option key={`start-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <span className="ms-2 font-medium text-zinc-700 dark:text-zinc-200">{t.hero.endShort}</span>
            <select
              value={endTime}
              onChange={(event) => emit(startDate, endDate, startTime, event.target.value)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-sky-400"
            >
              {TIMES.map((time) => (
                <option key={`end-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-2" dir="ltr">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => setView((current) => shiftMonth(current.year, current.month, -1))}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="grid min-w-0 flex-1 gap-8 md:grid-cols-2">
              <Month year={view.year} month={view.month} />
              <div className="hidden md:block">
                <Month year={nextView.year} month={nextView.month} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setView((current) => shiftMonth(current.year, current.month, 1))}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
