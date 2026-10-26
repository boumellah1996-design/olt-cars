"use client";

import { ArrowLeft } from "lucide-react";
import { useI18n } from "lib/i18n";
import { cn } from "lib/utils";

export function BackButton({ className }: { className?: string }) {
  const { t } = useI18n();

  function goBack() {
    window.history.back();
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-brand-yellow shadow-soft transition hover:bg-black hover:brightness-110 dark:bg-brand-yellow dark:text-zinc-950",
        className,
      )}
    >
      <ArrowLeft size={18} className="rtl:rotate-180" />
      {t.actions.back}
    </button>
  );
}

export function PageBackRow({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <BackButton />
      {children}
    </div>
  );
}
