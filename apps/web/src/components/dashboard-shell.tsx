"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  AlertCircle,
  Bot,
  Briefcase,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/lib/types";

const navByRole: Record<UserRole, { href: string; label: string; icon: LucideIcon }[]> = {
  customer: [
    { href: "/customer", label: "Home", icon: Home },
    { href: "/customer/workers", label: "Find workers", icon: Search },
    { href: "/customer/jobs", label: "My jobs", icon: Briefcase },
    { href: "/customer/support", label: "AI assistant", icon: Bot },
    { href: "/customer/complaints", label: "Complaints", icon: AlertCircle }
  ],
  worker: [
    { href: "/worker", label: "Home", icon: Home },
    { href: "/worker/jobs", label: "Jobs", icon: ClipboardList },
    { href: "/worker/profile", label: "Profile", icon: UserCircle },
    { href: "/worker/ai", label: "AI tips", icon: Sparkles }
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
    { href: "/admin/complaints", label: "Complaints", icon: MessageSquare }
  ]
};

export function DashboardShell({
  children,
  role
}: {
  children: ReactNode;
  role: UserRole;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const items = navByRole[role];

  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 md:hidden"
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="truncate text-base font-bold tracking-tight text-gradient">
              Rojgar Find – Daily Jobs
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ModeToggle />
            <Button type="button" variant="outline" size="sm" onClick={() => logout()} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 md:py-8">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[min(17rem,88vw)] border-r border-border/80 bg-card/95 p-4 pt-[4.5rem] shadow-lg transition-transform duration-200 ease-out md:static md:z-0 md:block md:w-56 md:shrink-0 md:rounded-2xl md:border md:bg-card/80 md:p-4 md:pt-4 md:shadow-card",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-brand/15 text-foreground shadow-sm ring-1 ring-brand/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "")} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-w-0 flex-1 pb-12 md:pb-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
