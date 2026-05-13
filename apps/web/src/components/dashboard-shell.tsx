"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/lib/types";

const navByRole: Record<
  UserRole,
  { href: string; label: string }[]
> = {
  customer: [
    { href: "/customer", label: "Home" },
    { href: "/customer/workers", label: "Find workers" },
    { href: "/customer/jobs", label: "My jobs" },
    { href: "/customer/support", label: "AI assistant" },
    { href: "/customer/complaints", label: "Complaints" }
  ],
  worker: [
    { href: "/worker", label: "Home" },
    { href: "/worker/jobs", label: "Jobs" },
    { href: "/worker/profile", label: "Profile" },
    { href: "/worker/ai", label: "AI tips" }
  ],
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/verifications", label: "Verifications" },
    { href: "/admin/complaints", label: "Complaints" }
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setOpen((o) => !o)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="font-semibold text-brand">
              Rojgar Find – Daily Jobs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button type="button" variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="mr-1 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 mt-[57px] w-60 border-r border-border bg-card p-4 transition md:static md:z-0 md:mt-0 md:block md:rounded-xl md:border",
            open ? "block" : "hidden md:block"
          )}
        >
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  pathname === item.href && "bg-muted text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
