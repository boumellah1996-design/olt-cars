"use client";

import { FormEvent, useState } from "react";
import { PageBackRow } from "@/components/frontend/BackButton";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { useI18n } from "lib/i18n";

export default function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <PublicLayout hideBack>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <PageBackRow />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] bg-zinc-950 p-8 text-white">
            <h1 className="text-3xl font-black">{t.contact.title}</h1>
            <p className="mt-6 text-zinc-300">{t.contact.address}</p>
            <p className="mt-2">{t.contact.phone}</p>
            <p className="mt-2">{t.contact.email}</p>
          </div>
          <form onSubmit={onSubmit} className="rounded-[28px] bg-white p-8 shadow-soft dark:bg-zinc-900">
            <input required placeholder={t.contact.name} className="mb-3 h-12 w-full rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950" />
            <textarea required placeholder={t.contact.message} className="mb-3 h-32 w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950" />
            <button type="submit" className="btn-cta h-12 w-full">
              {t.contact.send}
            </button>
            {sent && <p className="mt-4 text-sm text-emerald-600">{t.contact.sent}</p>}
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
