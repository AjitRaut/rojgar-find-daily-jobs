"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Skill, WorkerPublic } from "@/lib/types";

export default function FindWorkersPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [workers, setWorkers] = useState<WorkerPublic[]>([]);
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [skillSlug, setSkillSlug] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await api.get<Skill[]>("/skills");
      setSkills(res.data);
    })();
  }, []);

  async function search() {
    setLoading(true);
    try {
      const res = await api.get<WorkerPublic[]>("/workers", {
        params: { city: city || undefined, pincode: pincode || undefined, skill: skillSlug || undefined, q: q || undefined }
      });
      setWorkers(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find workers</h1>
        <p className="text-muted-foreground">Filter by location and trade.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Skill</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={skillSlug}
              onChange={(e) => setSkillSlug(e.target.value)}
            >
              <option value="">Any</option>
              {skills.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Indore" />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input value={pincode} onChange={(e) => setPincode(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Search</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bio keywords" />
          </div>
          <div className="md:col-span-4">
            <Button type="button" onClick={() => void search()} disabled={loading}>
              {loading ? "Searching…" : "Apply filters"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {workers.map((w) => (
          <Card key={w.id} className="border-border/80">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{w.display_name || "Worker"}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{w.bio || "—"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {w.skills.slice(0, 4).map((s) => (
                    <Badge key={s.skill_id} variant="default">
                      {s.skill_name}
                    </Badge>
                  ))}
                  <Badge variant="success">{w.verification_status}</Badge>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500" />
                  {w.rating_avg.toFixed(1)} · {w.total_jobs} jobs
                </div>
                <Link href={`/customer/workers/${w.id}`}>
                  <Button size="sm" variant="secondary">
                    View profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {workers.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">No workers match these filters yet.</p>
        )}
      </div>
    </div>
  );
}
