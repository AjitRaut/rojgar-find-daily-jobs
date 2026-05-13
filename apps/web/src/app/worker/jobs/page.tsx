"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  async function load() {
    const res = await api.get<Job[]>("/jobs/mine");
    setJobs(res.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(id: number, path: string) {
    await api.post(`/jobs/${id}/${path}`);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job inbox</h1>
        <p className="text-muted-foreground">Accept or reject new requests, then move work forward.</p>
      </div>
      <div className="space-y-4">
        {jobs.map((j) => (
          <Card key={j.id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">{j.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{j.location_text}</p>
              </div>
              <Badge>{j.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{j.description}</p>
              <p>Budget: ₹{j.budget}</p>
              <div className="flex flex-wrap gap-2">
                {j.status === "requested" && (
                  <>
                    <Button size="sm" onClick={() => void act(j.id, "accept")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void act(j.id, "reject")}>
                      Reject
                    </Button>
                  </>
                )}
                {j.status === "accepted" && (
                  <Button size="sm" onClick={() => void act(j.id, "start")}>
                    Start work
                  </Button>
                )}
                {j.status === "in_progress" && (
                  <Button size="sm" onClick={() => void act(j.id, "complete")}>
                    Mark complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs assigned.</p>}
      </div>
    </div>
  );
}
