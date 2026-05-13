import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  className
}: {
  title: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-5 shadow-card transition duration-300",
        "hover:border-brand/35 hover:shadow-glow-sm",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10 blur-2xl transition group-hover:bg-brand/20" />
      <div className="relative">
        {Icon ? <Icon className="mb-3 h-5 w-5 text-brand" aria-hidden /> : null}
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
