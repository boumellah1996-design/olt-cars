"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { useStore } from "lib/store";

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { isAdmin } = useStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("olt-admin-auth") !== "1") {
      router.replace("/login");
    }
  }, [isAdmin, router]);

  return (
    <div className="flex min-h-screen bg-[#f6f7f9] dark:bg-[#07080c]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <button type="button" onClick={() => setMenuOpen(true)} className="flex h-10 w-10 items-center justify-center">
            <Menu size={18} />
          </button>
          <Logo compact />
        </div>
        <Topbar title={title} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
