"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Skill, WorkerPublic } from "@/lib/types";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  budget: z.coerce.number().min(0),
  location_text: z.string().min(3),
  skill_id: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? undefined : n;
  }, z.number().optional())
});

type Form = z.infer<typeof schema>;

export default function WorkerDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [worker, setWorker] = useState<WorkerPublic | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    void (async () => {
      const [w, sk] = await Promise.all([
        api.get<WorkerPublic>(`/workers/${id}`),
        api.get<Skill[]>("/skills")
      ]);
      setWorker(w.data);
      setSkills(sk.data);
    })();
  }, [id]);

  if (!worker) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/customer/workers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{worker.display_name || "Worker"}</h1>
        <p className="text-muted-foreground">{worker.base_city} {worker.base_pincode ? `· ${worker.base_pincode}` : ""}</p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-amber-500" />
          {worker.rating_avg.toFixed(1)} · {worker.total_jobs} jobs ·{" "}
          <Badge>{worker.verification_status}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{worker.bio || "No bio yet."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {worker.skills.map((s) => (
              <Badge key={s.skill_id}>
                {s.skill_name} — ₹{s.rate_amount} / {s.rate_unit.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send job request</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4 max-w-xl"
            onSubmit={form.handleSubmit(async (data) => {
              await api.post("/jobs", {
                worker_user_id: worker.user_id,
                title: data.title,
                description: data.description,
                budget: data.budget,
                location_text: data.location_text,
                skill_id: data.skill_id || null
              });
              form.reset();
              alert("Job request sent.");
            })}
          >
            <div className="space-y-2">
              <Label>Related skill (optional)</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...form.register("skill_id", {
                  setValueAs: (v) => (v === "" || v == null ? undefined : Number(v))
                })}
                defaultValue=""
              >
                <option value="">General</option>
                {skills.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register("title")} placeholder="e.g. Fix kitchen wiring" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...form.register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <Input type="number" step="0.01" {...form.register("budget")} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...form.register("location_text")} placeholder="Area / landmark / village" />
              </div>
            </div>
            <Button type="submit">Send request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
