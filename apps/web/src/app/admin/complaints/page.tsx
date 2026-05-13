"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Complaint } from "@/lib/types";

export default function AdminComplaintsPage() {
  const [rows, setRows] = useState<Complaint[]>([]);

  const load = useCallback(async () => {
    const res = await api.get<Complaint[]>("/admin/complaints");
    setRows(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(id: number, status: "resolved" | "rejected") {
    await api.post(`/admin/complaints/${id}/resolve`, {
      status,
      admin_notes: "Reviewed via admin dashboard."
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Complaints</h1>
        <p className="text-muted-foreground">Triage customer reports and close the loop.</p>
      </div>
      <div className="space-y-3">
        {rows.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Complaint #{c.id}</CardTitle>
                <Badge className="mt-2">{c.status}</Badge>
              </div>
              {c.status === "open" && (
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => void resolve(c.id, "resolved")}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void resolve(c.id, "rejected")}>
                    Reject
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{c.description}</p>
              {c.admin_notes && <p className="text-xs">Admin: {c.admin_notes}</p>}
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No complaints.</p>}
      </div>
    </div>
  );
}
