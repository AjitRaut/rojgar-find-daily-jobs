"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Skill, WorkerPublic } from "@/lib/types";

const lineSchema = z.object({
  skill_id: z.coerce.number(),
  rate_amount: z.coerce.number().min(0),
  rate_unit: z.enum(["per_hour", "per_day", "per_job"]),
  notes: z.string().optional()
});

const schema = z.object({
  display_name: z.string().min(2),
  bio: z.string().min(10),
  experience_years: z.coerce.number().min(0),
  base_city: z.string().optional(),
  base_pincode: z.string().optional(),
  skills: z.array(lineSchema)
});

type Form = z.infer<typeof schema>;

export default function WorkerProfilePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: "",
      bio: "I offer honest work and clear pricing.",
      experience_years: 0,
      base_city: "",
      base_pincode: "",
      skills: []
    }
  });
  const { reset } = form;

  useEffect(() => {
    let active = true;
    void (async () => {
      const sk = await api.get<Skill[]>("/skills");
      if (!active) return;
      setSkills(sk.data);
      try {
        const me = await api.get<WorkerPublic>("/workers/me");
        if (!active) return;
        reset({
          display_name: me.data.display_name || "",
          bio: me.data.bio || "",
          experience_years: me.data.experience_years,
          base_city: me.data.base_city || "",
          base_pincode: me.data.base_pincode || "",
          skills:
            me.data.skills.length > 0
              ? me.data.skills.map((s) => ({
                  skill_id: s.skill_id,
                  rate_amount: s.rate_amount,
                  rate_unit: s.rate_unit as Form["skills"][0]["rate_unit"],
                  notes: s.notes || ""
                }))
              : []
        });
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, [reset]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Professional profile</h1>
        <p className="text-muted-foreground">Skills with rates help customers compare and book you.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-xl space-y-4"
            onSubmit={form.handleSubmit(async (data) => {
              await api.put("/workers/me", data);
              alert("Profile saved.");
            })}
          >
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input {...form.register("display_name")} />
            </div>
            <div className="space-y-2">
              <Label>Bio (min 10 characters)</Label>
              <Textarea rows={5} {...form.register("bio")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input type="number" {...form.register("experience_years")} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input {...form.register("base_city")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input {...form.register("base_pincode")} />
            </div>

            <div className="space-y-2">
              <Label>Skills &amp; rates</Label>
              <p className="text-xs text-muted-foreground">Add a row per trade you offer.</p>
              {(form.watch("skills") || []).map((_, idx) => (
                <div key={idx} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-4">
                  <select
                    className="rounded-lg border border-input bg-background px-2 text-sm"
                    {...form.register(`skills.${idx}.skill_id` as const, { valueAsNumber: true })}
                  >
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <Input type="number" placeholder="Rate ₹" {...form.register(`skills.${idx}.rate_amount`)} />
                  <select
                    className="rounded-lg border border-input bg-background px-2 text-sm"
                    {...form.register(`skills.${idx}.rate_unit` as const)}
                  >
                    <option value="per_day">Per day</option>
                    <option value="per_hour">Per hour</option>
                    <option value="per_job">Per job</option>
                  </select>
                  <Input placeholder="Notes" {...form.register(`skills.${idx}.notes` as const)} />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  form.setValue("skills", [
                    ...(form.getValues("skills") || []),
                    {
                      skill_id: skills[0]?.id ?? 1,
                      rate_amount: 0,
                      rate_unit: "per_day",
                      notes: ""
                    }
                  ])
                }
              >
                Add skill row
              </Button>
            </div>

            <Button type="submit">Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
