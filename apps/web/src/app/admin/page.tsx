"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin overview</h1>
          <p className="text-muted-foreground">Verification, complaints, and platform health.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/verifications">
            <Button size="sm" variant="outline" className="gap-1">
              <Shield className="h-4 w-4" /> Verifications
            </Button>
          </Link>
          <Link href="/admin/complaints">
            <Button size="sm" variant="outline">
              Complaints
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total users" value={m ? String(m.total_users) : "—"} />
        <StatCard title="Workers" value={m ? String(m.total_workers) : "—"} />
        <StatCard title="Jobs" value={m ? String(m.total_jobs) : "—"} />
        <StatCard title="Pending verifications" value={m ? String(m.pending_verifications) : "—"} />
        <StatCard title="Open complaints" value={m ? String(m.open_complaints) : "—"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
          <CardDescription>Use the sidebar for day-to-day moderation workflows.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Default seed admin: <code className="rounded bg-muted px-1">admin@rojgar-find.local</code> — see deployment docs
          for password (change in production).
        </CardContent>
      </Card>
    </div>
  );
}
