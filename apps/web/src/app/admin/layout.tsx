"use client";

import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { RequireRole } from "@/components/require-role";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="admin">
      <DashboardShell role="admin">{children}</DashboardShell>
    </RequireRole>
  );
}
