"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export default function CustomerSupportPage() {
  const [msg, setMsg] = useState("I need a plumber for a leaking tap in my kitchen.");
  const [reply, setReply] = useState<string | null>(null);
  const [reco, setReco] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendChat() {
    setLoading(true);
    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { message: msg });
      setReply(res.data.reply);
    } finally {
      setLoading(false);
    }
  }

  async function recommend() {
    setLoading(true);
    try {
      const res = await api.post("/ai/recommend-workers", {
        job_text: msg,
        city: "",
        pincode: "",
        skill_slug: null
      });
      setReco(JSON.stringify(res.data.recommendations, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI assistant</h1>
        <p className="text-muted-foreground">Ask how to describe jobs or get worker recommendations.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void sendChat()} disabled={loading}>
              Ask assistant
            </Button>
            <Button type="button" variant="secondary" onClick={() => void recommend()} disabled={loading}>
              Recommend workers
            </Button>
          </div>
          {reply && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">Reply</p>
              <p className="text-muted-foreground">{reply}</p>
            </div>
          )}
          {reco && (
            <div className="rounded-lg bg-muted p-3 font-mono text-xs overflow-x-auto">
              <p className="mb-2 font-sans font-medium text-foreground">Recommendations (JSON)</p>
              <pre>{reco}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
