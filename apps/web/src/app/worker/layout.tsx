"use client";

import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { RequireRole } from "@/components/require-role";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="worker">
      <DashboardShell role="worker">{children}</DashboardShell>
    </RequireRole>
  );
}
