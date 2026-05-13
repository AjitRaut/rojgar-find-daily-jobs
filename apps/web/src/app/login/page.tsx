"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Lock, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { dashboardForRole } from "@/lib/routes";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="relative min-h-screen bg-mesh">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-violet-500/10" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:items-center md:justify-center md:gap-12 lg:gap-20">
        <div className="mx-auto max-w-md flex-1 space-y-6 md:mx-0 md:max-w-none">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Welcome back</h1>
            <p className="text-lg text-muted-foreground">Sign in to continue hiring and managing your jobs.</p>
          </div>
          <div className="hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-card backdrop-blur md:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-6 text-lg font-semibold text-foreground">Rojgar Find – Daily Jobs</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Responsive dashboards, AI assistance, and a verification-backed worker network — tuned for clarity.
            </p>
          </div>
        </div>

        <Card className="relative w-full max-w-md border-gradient shadow-glow md:shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Use the email and password you registered with.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(async (data) => {
                try {
                  const user = await login(data.email, data.password);
                  router.replace(dashboardForRole(user.role));
                } catch {
                  form.setError("root", { message: "Invalid email or password" });
                }
              })}
            >
              {form.formState.errors.root ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  Email
                </Label>
                <Input id="email" type="email" autoComplete="email" className="h-11 rounded-xl" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  Password
                </Label>
                <Input id="password" type="password" autoComplete="current-password" className="h-11 rounded-xl" {...form.register("password")} />
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link className="font-semibold text-brand underline-offset-4 hover:underline" href="/register">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
