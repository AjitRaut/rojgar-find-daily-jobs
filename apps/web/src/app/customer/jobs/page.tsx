"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional()
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function CustomerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviewJobId, setReviewJobId] = useState<number | null>(null);
  const form = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5 } });

  async function load() {
    const res = await api.get<Job[]>("/jobs/mine");
    setJobs(res.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancelJob(id: number) {
    await api.post(`/jobs/${id}/cancel`);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My jobs</h1>
        <p className="text-muted-foreground">Track requests you have sent to workers.</p>
      </div>
      <div className="space-y-4">
        {jobs.map((j) => (
          <Card key={j.id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">{j.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{j.location_text}</p>
              </div>
              <Badge variant={j.status === "completed" ? "success" : "default"}>{j.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{j.description}</p>
              <p>Budget: ₹{j.budget}</p>
              <div className="flex flex-wrap gap-2">
                {!["completed", "cancelled", "rejected"].includes(j.status) && (
                  <Button type="button" variant="outline" size="sm" onClick={() => void cancelJob(j.id)}>
                    Cancel job
                  </Button>
                )}
                {j.status === "completed" && (
                  <Button type="button" size="sm" onClick={() => setReviewJobId(j.id)}>
                    Leave review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet.</p>}
      </div>

      {reviewJobId !== null && (
        <Card className="border-brand/40">
          <CardHeader>
            <CardTitle className="text-base">Review job #{reviewJobId}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="max-w-md space-y-3"
              onSubmit={form.handleSubmit(async (data) => {
                await api.post(`/jobs/${reviewJobId}/review`, data);
                setReviewJobId(null);
                await load();
              })}
            >
              <div className="space-y-2">
                <Label>Rating (1–5)</Label>
                <Input type="number" min={1} max={5} {...form.register("rating")} />
              </div>
              <div className="space-y-2">
                <Label>Comment</Label>
                <Textarea {...form.register("comment")} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit review</Button>
                <Button type="button" variant="ghost" onClick={() => setReviewJobId(null)}>
                  Close
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
