import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition", {
  variants: {
    variant: {
      default: "border-transparent bg-muted text-foreground",
      success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      warning: "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-400",
      destructive: "border-transparent bg-red-500/15 text-red-700 dark:text-red-400"
    }
  },
  defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof variants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(variants({ variant }), className)} {...props} />;
}
