"use client";

import Link from "next/link";
import { Briefcase, Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

export default function CustomerHome() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get<Job[]>("/jobs/mine");
        setJobs(res.data);
      } catch {
        setJobs([]);
      }
    })();
  }, []);

  const active = jobs.filter((j) => ["requested", "accepted", "in_progress"].includes(j.status)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer dashboard</h1>
        <p className="text-muted-foreground">Search workers, send job requests, and track progress.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active jobs" value={String(active)} />
        <StatCard title="Total jobs" value={String(jobs.length)} />
        <StatCard title="AI assistant" value="24/7" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/customer/workers">
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Find workers
          </Button>
        </Link>
        <Link href="/customer/jobs">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            My jobs
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>Three steps to your first hire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Search by skill, city, or pincode.</p>
          <p>2. Open a worker profile and send a job request with budget &amp; location.</p>
          <p>3. Track acceptance and completion; leave a review when done.</p>
        </CardContent>
      </Card>
    </div>
  );
}
