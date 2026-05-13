"use client";

import Link from "next/link";
import { ClipboardList, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Worker dashboard</h1>
        <p className="text-muted-foreground">Hi {user?.full_name} — manage incoming jobs and your profile.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending requests" value={String(pending)} />
        <StatCard title="Active jobs" value={String(active)} />
        <StatCard title="Total" value={String(jobs.length)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/worker/jobs">
          <Button className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Jobs
          </Button>
        </Link>
        <Link href="/worker/profile">
          <Button variant="outline" className="gap-2">
            <UserCircle className="h-4 w-4" />
            Edit profile
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trust & visibility</CardTitle>
          <CardDescription>Admins verify profiles; customers see your ratings and skills.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Complete your bio, add per-skill rates, and request verification from the admin team.
        </CardContent>
      </Card>
    </div>
  );
}
