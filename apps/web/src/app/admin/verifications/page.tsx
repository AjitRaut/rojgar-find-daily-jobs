"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { WorkerPublic } from "@/lib/types";

export default function AdminVerificationsPage() {
  const [rows, setRows] = useState<WorkerPublic[]>([]);

  const load = useCallback(async () => {
    const res = await api.get<WorkerPublic[]>("/admin/verifications");
    setRows(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: number) {
    await api.post(`/admin/verifications/${id}/approve`);
    await load();
  }

  async function reject(id: number) {
    await api.post(`/admin/verifications/${id}/reject`);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Worker verification</h1>
        <p className="text-muted-foreground">Approve trusted workers for the marketplace.</p>
      </div>
      <div className="space-y-3">
        {rows.map((w) => (
          <Card key={w.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">{w.display_name || `Profile #${w.id}`}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {w.base_city} · rating {w.rating_avg.toFixed(1)}
                </p>
                <Badge className="mt-2">{w.verification_status}</Badge>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" onClick={() => void approve(w.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => void reject(w.id)}>
                  Reject
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{w.bio}</p>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No profiles in this queue.</p>}
      </div>
    </div>
  );
}
