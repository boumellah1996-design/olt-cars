"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/frontend/BackButton";
import { PublicFooter } from "@/components/frontend/PublicFooter";
import { PublicHeader } from "@/components/frontend/PublicHeader";
import { WhatsAppButton } from "@/components/frontend/WhatsAppButton";

export function PublicLayout({
  children,
  hideBack = false,
}: {
  children: React.ReactNode;
  hideBack?: boolean;
}) {
  const pathname = usePathname();
  const showBack = pathname !== "/" && !hideBack;

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#07080c]">
      <PublicHeader />
      {showBack && (
        <div className="sticky top-[76px] z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
            <BackButton />
          </div>
        </div>
      )}
      <main>{children}</main>
      <PublicFooter />
      <WhatsAppButton />
    </div>
  );
}
