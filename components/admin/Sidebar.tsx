"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  CalendarDays,
  Car,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Receipt,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};
import { Logo } from "@/components/Logo";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";
import { cn } from "lib/utils";

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { t } = useI18n();
  const { logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const operations: NavLink[] = [
    { href: "/admin", label: t.admin.dashboard, icon: LayoutDashboard },
    { href: "/admin/reservations", label: t.admin.reservations, icon: CalendarDays },
    { href: "/admin/planning", label: t.admin.planning, icon: CalendarDays },
    { href: "/admin/rentals", label: t.admin.rentals, icon: ArrowLeftRight },
    { href: "/admin/clients", label: t.admin.clients, icon: Users },
  ];
  const fleet: NavLink[] = [
    { href: "/admin/vehicles", label: t.admin.vehicles, icon: Car },
    { href: "/admin/maintenance", label: t.admin.maintenance, icon: Wrench },
    { href: "/admin/documents", label: t.admin.documents, icon: FileText },
    { href: "/admin/incidents", label: t.admin.incidents, icon: AlertTriangle },
    { href: "/admin/gps", label: t.admin.gps, icon: MapPinned },
  ];
  const finance: NavLink[] = [
    { href: "/admin/payments", label: t.admin.payments, icon: Banknote },
    { href: "/admin/expenses", label: t.admin.expenses, icon: Receipt },
    { href: "/admin/cash", label: t.admin.cash, icon: Wallet },
  ];

  function section(title: string, items: NavLink[]) {
    return (
      <div className="mb-6">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-40 h-screen w-[250px] shrink-0 flex-col bg-[#0b0d12] text-white md:sticky md:flex",
        open ? "flex" : "hidden md:flex",
      )}
    >
      <div className="px-5 py-5">
        <Logo inverted compact />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {section(t.admin.operations, operations)}
        {section(t.admin.fleet, fleet)}
        {section(t.admin.finance, finance)}
      </nav>
      <div className="border-t border-white/10 p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {t.admin.administration}
        </p>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          {t.admin.logout}
        </button>
      </div>
    </aside>
  );
}
