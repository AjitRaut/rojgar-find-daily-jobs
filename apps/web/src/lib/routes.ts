import type { UserRole } from "@/lib/types";

export function dashboardForRole(role: UserRole): string {
  switch (role) {
    case "customer":
      return "/customer";
    case "worker":
      return "/worker";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
