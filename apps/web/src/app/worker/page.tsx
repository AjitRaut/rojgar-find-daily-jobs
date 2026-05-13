"use client";

import Link from "next/link";
import { ClipboardList, LayoutList, Sparkles, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

export default function WorkerHome() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await api.get<Job[]>("/jobs/mine");
      setJobs(res.data);
    })();
  }, []);

  const pending = jobs.filter((j) => j.status === "requested").length;
  const active = jobs.filter((j) => ["accepted", "in_progress"].includes(j.status)).length;

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Hi, ${user?.full_name?.split(" ")[0] ?? "there"}`}
        description="Manage incoming requests, keep your profile sharp, and grow trust with every completed job."
        actions={
          <>
            <Link href="/worker/jobs">
              <Button className="gap-2 rounded-xl shadow-md">
                <ClipboardList className="h-4 w-4" />
                Jobs
              </Button>
            </Link>
            <Link href="/worker/profile">
              <Button variant="outline" className="gap-2 rounded-xl">
                <UserCircle className="h-4 w-4" />
                Profile
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Pending requests" value={String(pending)} icon={ClipboardList} hint="Awaiting your response" />
        <StatCard title="Active jobs" value={String(active)} icon={Sparkles} hint="Accepted or in progress" />
        <StatCard title="All jobs" value={String(jobs.length)} icon={LayoutList} hint="Lifetime on your account" />
      </div>

      <Card className="rounded-2xl border-brand/20 bg-gradient-to-br from-brand/5 via-card to-card">
        <CardHeader>
          <CardTitle className="text-xl">Trust & visibility</CardTitle>
          <CardDescription>Verification and ratings help customers choose with confidence.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          Complete your bio, add per-skill rates, and request verification from the admin team. Stronger profiles surface
          higher in recommendations.
        </CardContent>
      </Card>
    </div>
  );
}
