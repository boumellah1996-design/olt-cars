"use client";

import { Bell, Moon, Plus, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { AddModal } from "@/components/admin/AddModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { useTheme } from "lib/theme";

export function Topbar({ title }: { title: string }) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { kpis } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);

  const alerts = useMemo(() => kpis.late.length + kpis.pendingCount, [kpis]);

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{t.admin.workspace}</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">{t.admin.company}</p>
      </div>
      <div className="hidden flex-1 justify-center px-10 md:flex">
        <label className="relative w-full max-w-md">
          <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.admin.search}
            className="h-11 w-full rounded-full border border-zinc-200 bg-zinc-50 ps-11 pe-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          <Plus size={16} />
          {t.admin.add}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <LanguageSelector compact />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifs((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800"
          >
            <Bell size={16} />
            {alerts > 0 && <span className="absolute end-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
          </button>
          {showNotifs && (
            <div className="absolute end-0 z-20 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-3 text-sm shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-2 font-semibold">{t.admin.notifications}</p>
              <p className="text-zinc-500">
                {kpis.late.length} {t.admin.lateReturn.toLowerCase()} · {kpis.pendingCount} {t.admin.pending.toLowerCase()}
              </p>
            </div>
          )}
        </div>
        <div className="ms-2 hidden items-center gap-2 sm:flex">
          <div className="text-end">
            <p className="text-xs font-medium">riadboumellah94@gmail.com</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400">Super Admin</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white dark:bg-white dark:text-zinc-950">
            R
          </div>
        </div>
      </div>
      <AddModal open={open} onClose={() => setOpen(false)} />
      <span className="sr-only">{title}</span>
    </header>
  );
}
