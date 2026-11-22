"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserCheck, Users, FileText, AlertOctagon, History } from "lucide-react";
import clsx from "clsx";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/verifications", label: "Verifications", icon: UserCheck },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/reports", label: "Reports", icon: AlertOctagon },
    { href: "/admin/audit-log", label: "Audit Log", icon: History },
  ];

  return (
    <div className="border-b-2.5 border-ink bg-surface sticky top-0 z-30">
      <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl sm:text-2xl text-ink">
              Campus Moderator Desk
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow border-1.5 border-ink text-ink uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap transition border-2 border-ink",
                    isActive
                      ? "bg-yellow text-ink shadow-hard-btn -translate-y-0.5"
                      : "bg-surface text-ink hover:bg-paper"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
