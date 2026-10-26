"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LOCALES, useI18n } from "lib/i18n";
import { cn } from "lib/utils";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[1];

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-800 dark:text-zinc-100"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
      >
        <Globe size={14} />
        <span>{compact ? current.short : current.native}</span>
        <ChevronDown size={14} className={cn("transition", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute end-0 z-50 mt-2 min-w-[176px] rounded-2xl border border-zinc-200 bg-white p-1 shadow-card dark:border-zinc-800 dark:bg-zinc-900"
        >
          {LOCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={locale === item.id}
              onClick={() => {
                setLocale(item.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm",
                locale === item.id
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
              )}
            >
              <span>{item.native}</span>
              <span className="text-[11px] opacity-60">{item.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
