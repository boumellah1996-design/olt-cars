"use client";

import { PageBackRow } from "@/components/frontend/BackButton";
import { PublicLayout } from "@/components/frontend/PublicLayout";
import { useI18n } from "lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <PublicLayout hideBack>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-[28px] bg-white p-8 shadow-soft dark:bg-zinc-900">
          <PageBackRow />
          <h1 className="text-4xl font-black">{t.about.title}</h1>
          <p className="mt-6 leading-7 text-zinc-600 dark:text-zinc-300">{t.about.p1}</p>
          <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-300">{t.about.p2}</p>
        </div>
      </div>
    </PublicLayout>
  );
}
