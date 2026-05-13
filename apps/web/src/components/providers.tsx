"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
