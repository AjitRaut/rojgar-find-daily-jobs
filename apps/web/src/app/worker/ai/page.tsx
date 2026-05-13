"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function WorkerAiPage() {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.post<{ suggestions: string[] }>("/ai/profile-tips");
      setTips(res.data.suggestions || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile optimization</h1>
        <p className="text-muted-foreground">AI-generated ideas to improve trust and bookings.</p>
      </div>
      <Button type="button" onClick={() => void load()} disabled={loading}>
        {loading ? "Generating…" : "Get suggestions"}
      </Button>
      {tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              {tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
