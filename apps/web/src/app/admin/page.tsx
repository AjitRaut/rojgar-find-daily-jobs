"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Briefcase, MessageSquare, Shield, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/api";

type Metrics = {
  total_users: number;
  total_workers: number;
  total_jobs: number;
  pending_verifications: number;
  open_complaints: number;
};

export default function AdminDashboard() {
  const [m, setM] = useState<Metrics | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await api.get<Metrics>("/admin/metrics");
      setM(res.data);
    })();
  }, []);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Admin overview"
        description="Monitor verification load, complaints, and overall platform health at a glance."
        actions={
          <>
            <Link href="/admin/verifications">
              <Button size="sm" variant="outline" className="gap-2 rounded-xl">
                <Shield className="h-4 w-4" />
                Verifications
              </Button>
            </Link>
            <Link href="/admin/complaints">
              <Button size="sm" variant="outline" className="gap-2 rounded-xl">
                <MessageSquare className="h-4 w-4" />
                Complaints
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total users" value={m ? String(m.total_users) : "—"} icon={Users} />
        <StatCard title="Workers" value={m ? String(m.total_workers) : "—"} icon={Shield} hint="Registered worker role" />
        <StatCard title="Jobs" value={m ? String(m.total_jobs) : "—"} icon={Briefcase} />
        <StatCard
          title="Pending verifications"
          value={m ? String(m.pending_verifications) : "—"}
          icon={AlertTriangle}
          hint="Needs admin decision"
        />
        <StatCard title="Open complaints" value={m ? String(m.open_complaints) : "—"} icon={MessageSquare} />
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-xl">Operations</CardTitle>
          <CardDescription>Use the sidebar for day-to-day moderation workflows.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          Default seed admin: <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-foreground">admin@rojgar-find.local</code>{" "}
          — see deployment docs for password (change in production).
        </CardContent>
      </Card>
    </div>
  );
}
