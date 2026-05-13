"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Complaint } from "@/lib/types";

const schema = z.object({
  description: z.string().min(10),
  subject_worker_profile_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().optional()
  ),
  subject_job_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().optional()
  )
});

type Form = z.infer<typeof schema>;

export default function CustomerComplaintsPage() {
  const [list, setList] = useState<Complaint[]>([]);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  async function load() {
    const res = await api.get<Complaint[]>("/complaints/mine");
    setList(res.data);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Complaints</h1>
        <p className="text-muted-foreground">Report issues; admins review in the operations queue.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">File a complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-xl space-y-3"
            onSubmit={form.handleSubmit(async (data) => {
              const payload = {
                description: data.description,
                subject_worker_profile_id: data.subject_worker_profile_id || undefined,
                subject_job_id: data.subject_job_id || undefined
              };
              await api.post("/complaints", payload);
              form.reset();
              await load();
            })}
          >
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} {...form.register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Worker profile id (optional)</Label>
                <Input type="number" placeholder="e.g. 3" {...form.register("subject_worker_profile_id")} />
              </div>
              <div className="space-y-2">
                <Label>Job id (optional)</Label>
                <Input type="number" {...form.register("subject_job_id")} />
              </div>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Your submissions</h2>
        {list.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <p className="text-xs text-muted-foreground">#{c.id}</p>
              </div>
              <Badge>{c.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No complaints yet.</p>}
      </div>
    </div>
  );
}
