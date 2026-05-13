"use client";

import Link from "next/link";
import { Briefcase, ListChecks, Search, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
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
    <div className="space-y-10">
      <PageHeader
        title="Customer home"
        description="Search workers, send structured job requests, and track every milestone in one calm view."
        actions={
          <>
            <Link href="/customer/workers">
              <Button className="gap-2 rounded-xl shadow-md">
                <Search className="h-4 w-4" />
                Find workers
              </Button>
            </Link>
            <Link href="/customer/jobs">
              <Button variant="outline" className="gap-2 rounded-xl">
                <Briefcase className="h-4 w-4" />
                My jobs
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Active jobs" value={String(active)} icon={ListChecks} hint="Requested through in progress" />
        <StatCard title="Total jobs" value={String(jobs.length)} icon={Briefcase} hint="All time on your account" />
        <StatCard title="AI assistant" value="24/7" icon={Sparkles} hint="Tips & drafting in Support" />
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-xl">Getting started</CardTitle>
          <CardDescription>Three quick steps to your first verified hire</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Discover",
              d: "Filter by skill, city, or pincode — profiles show rates and verification."
            },
            {
              n: "2",
              t: "Request",
              d: "Send a job with budget, schedule, and location. Workers respond in-app."
            },
            {
              n: "3",
              t: "Complete",
              d: "Track status updates, then leave a review to strengthen the network."
            }
          ].map((step) => (
            <div key={step.n} className="relative rounded-2xl border border-border/60 bg-card/80 p-5">
              <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-md">
                {step.n}
              </span>
              <p className="font-semibold text-foreground">{step.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
