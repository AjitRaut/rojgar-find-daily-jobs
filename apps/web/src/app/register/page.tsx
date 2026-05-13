"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Briefcase, Building2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { dashboardForRole } from "@/lib/routes";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "worker"]),
  city: z.string().optional(),
  pincode: z.string().optional()
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: "customer" }
  });
  const role = form.watch("role");

  return (
    <div className="relative min-h-screen bg-mesh">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-cyan-500/5 via-transparent to-brand/10" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:items-start md:justify-center md:gap-12 md:py-12 lg:gap-16">
        <div className="mx-auto w-full max-w-md space-y-6 md:sticky md:top-12 md:mx-0 md:max-w-sm md:flex-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Create your account</h1>
            <p className="text-lg text-muted-foreground">
              Choose how you will use Rojgar Find – Daily Jobs, then tell us a bit about you.
            </p>
          </div>
          <ul className="hidden space-y-4 text-sm text-muted-foreground md:block">
            <li className="flex gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span>
                <strong className="text-foreground">Customers</strong> post jobs, compare workers, and track delivery.
              </span>
            </li>
            <li className="flex gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span>
                <strong className="text-foreground">Workers</strong> showcase skills, set rates, and grow with reviews.
              </span>
            </li>
          </ul>
        </div>

        <Card className="relative w-full max-w-lg border-gradient shadow-glow md:shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>All fields marked implicitly required below must be filled.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(async (data) => {
                try {
                  const user = await registerUser({
                    full_name: data.full_name,
                    email: data.email,
                    password: data.password,
                    role: data.role as UserRole,
                    city: data.city,
                    pincode: data.pincode
                  });
                  router.replace(dashboardForRole(user.role));
                } catch {
                  form.setError("root", {
                    message: "Could not register. Email may already exist."
                  });
                }
              })}
            >
              {form.formState.errors.root ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => form.setValue("role", "customer", { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition",
                      role === "customer"
                        ? "border-brand bg-brand/10 shadow-sm ring-2 ring-brand/20"
                        : "border-border/80 bg-muted/30 hover:border-brand/40"
                    )}
                  >
                    <Building2 className={cn("h-6 w-6", role === "customer" ? "text-brand" : "text-muted-foreground")} />
                    <span className="text-sm font-semibold text-foreground">Customer</span>
                    <span className="text-[11px] leading-tight text-muted-foreground">I want to hire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setValue("role", "worker", { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition",
                      role === "worker"
                        ? "border-brand bg-brand/10 shadow-sm ring-2 ring-brand/20"
                        : "border-border/80 bg-muted/30 hover:border-brand/40"
                    )}
                  >
                    <User className={cn("h-6 w-6", role === "worker" ? "text-brand" : "text-muted-foreground")} />
                    <span className="text-sm font-semibold text-foreground">Worker</span>
                    <span className="text-[11px] leading-tight text-muted-foreground">I offer services</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" className="h-11 rounded-xl" {...form.register("full_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" className="h-11 rounded-xl" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" className="h-11 rounded-xl" {...form.register("password")} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City (optional)</Label>
                  <Input id="city" className="h-11 rounded-xl" {...form.register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" className="h-11 rounded-xl" {...form.register("pincode")} />
                </div>
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating…" : "Create account"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link className="font-semibold text-brand underline-offset-4 hover:underline" href="/login">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
