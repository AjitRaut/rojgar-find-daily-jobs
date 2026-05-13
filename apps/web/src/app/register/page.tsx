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
import type { UserRole } from "@/lib/types";

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Join Rojgar Find – Daily Jobs as a customer or worker</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
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
            {form.formState.errors.root && (
              <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...form.register("full_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...form.register("role")}
              >
                <option value="customer">Customer (hire workers)</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City (optional)</Label>
                <Input id="city" {...form.register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...form.register("pincode")} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link className="text-brand underline" href="/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
