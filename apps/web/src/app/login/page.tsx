"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to Rojgar Find – Daily Jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (data) => {
              try {
                const user = await login(data.email, data.password);
                router.replace(dashboardForRole(user.role));
              } catch {
                form.setError("root", { message: "Invalid email or password" });
              }
            })}
          >
            {form.formState.errors.root && (
              <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link className="text-brand underline" href="/register">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
