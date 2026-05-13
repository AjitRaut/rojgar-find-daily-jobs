"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/lib/types";

export function RequireRole({
  role,
  children
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace("/");
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
