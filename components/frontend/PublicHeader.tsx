"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";
import { useI18n } from "lib/i18n";
import { MAPS_URL } from "lib/site";
import { useTheme } from "lib/theme";
import { cn } from "lib/utils";

export function PublicHeader() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/vehicles", label: t.nav.vehicles },
    { href: "/follow", label: t.nav.follow },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur dark:bg-zinc-950/95">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center rounded-full bg-zinc-100 p-1 dark:bg-zinc-900 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
            aria-label={theme === "light" ? t.theme.dark : t.theme.light}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <LanguageSelector />
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center gap-1.5 rounded-full border border-zinc-200 px-3 text-sm font-medium text-zinc-800 dark:border-zinc-800 dark:text-zinc-100"
            aria-label={t.nav.location}
            title={t.nav.location}
          >
            <MapPin size={16} />
            <span className="hidden sm:inline">{t.nav.location}</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 md:hidden dark:border-zinc-800"
            aria-label="Menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-zinc-100 px-4 py-3 md:hidden dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm",
                  pathname === link.href ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-700 dark:text-zinc-200",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
