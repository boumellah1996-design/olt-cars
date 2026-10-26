"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageBackRow } from "@/components/frontend/BackButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("riadboumellah94@gmail.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = login(email, password);
    setError(!ok);
    if (ok) router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 dark:bg-[#07080c]">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-card dark:bg-zinc-900">
        <PageBackRow />
        <div className="mb-4 flex items-start justify-between gap-3">
          <Logo />
          <LanguageSelector compact />
        </div>
        <h1 className="mt-6 text-2xl font-black">{t.login.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{t.login.hint}</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.login.email}
          className="mt-6 h-12 w-full rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.login.password}
          className="mt-3 h-12 w-full rounded-full border border-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-950"
        />
        {error && <p className="mt-3 text-sm text-rose-500">{t.login.error}</p>}
        <button type="submit" className="mt-5 h-12 w-full rounded-full bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950">
          {t.login.submit}
        </button>
      </form>
    </div>
  );
}
