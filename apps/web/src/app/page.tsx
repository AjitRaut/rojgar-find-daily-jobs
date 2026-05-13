"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <span className="text-lg font-semibold text-brand">Rojgar Find – Daily Jobs</span>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="mb-3 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Rojgar Find – Daily Jobs · Balanced MVP
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Hire verified electricians, plumbers, painters &amp; labour{" "}
            <span className="text-brand">near you</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Post job requests, match workers with AI assistance, track work, and build trust with ratings — built for
            rural &amp; semi-urban workforce markets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                I have an account
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Customer & worker panels",
              desc: "Direct hire flow, job lifecycle, and role-based dashboards."
            },
            {
              icon: Sparkles,
              title: "AI assistant & matching",
              desc: "Chat support, job text analysis, and hybrid recommendations."
            },
            {
              icon: ArrowRight,
              title: "Admin operations",
              desc: "Verification queue, complaints, and platform metrics in one view."
            }
          ].map((x, i) => (
            <motion.div
              key={x.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className="h-full border-border/80">
                <CardHeader>
                  <x.icon className="mb-2 h-8 w-8 text-brand" />
                  <CardTitle className="text-base">{x.title}</CardTitle>
                  <CardDescription>{x.desc}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
