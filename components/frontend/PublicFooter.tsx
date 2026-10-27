"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useI18n } from "lib/i18n";

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <Logo />
        <p className="text-sm text-zinc-500">{t.footer.rights}</p>
        <Link href="/login" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t.footer.admin}
        </Link>
      </div>
    </footer>
  );
}
