"use client";

import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { RequireRole } from "@/components/require-role";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="customer">
      <DashboardShell role="customer">{children}</DashboardShell>
    </RequireRole>
  );
}
