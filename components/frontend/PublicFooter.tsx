"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useI18n } from "lib/i18n";

const MAPS_URL = "https://maps.app.goo.gl/Gc5vYic9nr7BxVhTA";
const PHONE_HREF = "tel:+213540177511";
const EMAIL_HREF = "mailto:contact@oltlocation.dz";

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-zinc-200 bg-white pb-28 pt-12 dark:border-zinc-800 dark:bg-zinc-950 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3 md:items-start md:gap-8">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo />
          <p className="text-center text-sm text-zinc-500 md:text-start">{t.footer.rights}</p>
        </div>

        <address className="mx-auto flex max-w-md items-start gap-3 not-italic md:mx-0">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-zinc-950">
            <MapPin size={18} />
          </span>
          <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            <p className="font-semibold text-zinc-950 dark:text-white">{t.footer.location}</p>
            <p>{t.contact.street}</p>
            <p>{t.contact.city}</p>
            <p>{t.contact.country}</p>
            <p className="mt-3 flex items-center gap-2">
              <Phone size={14} className="shrink-0" />
              <a href={PHONE_HREF} className="hover:text-zinc-950 dark:hover:text-white">
                {t.contact.phone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="shrink-0" />
              <a href={EMAIL_HREF} className="break-all hover:text-zinc-950 dark:hover:text-white">
                {t.contact.email}
              </a>
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
            >
              {t.footer.maps}
            </a>
          </div>
        </address>

        <div className="flex justify-center md:justify-end">
          <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">
            {t.footer.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
