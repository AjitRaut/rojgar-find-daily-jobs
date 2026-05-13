"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MessageCircle,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteFooter } from "@/components/site-footer";

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand/10 via-transparent to-transparent" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 md:py-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-gradient md:text-xl">
          Rojgar Find – Daily Jobs
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="sm:px-4">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-8">
        <section className="grid gap-12 pb-16 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-8">
          <motion.div {...fade} transition={{ duration: 0.45 }} className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Live matching · AI-assisted
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Hire skilled workers{" "}
              <span className="text-gradient">without the guesswork.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Post jobs, discover verified profiles, chat with an assistant, and track every step — built for busy
              households and professionals across India.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/register">
                <Button size="lg" className="gap-2 rounded-xl px-8 text-base shadow-glow">
                  Start hiring <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-xl px-6 text-base">
                  I have an account
                </Button>
              </Link>
            </div>
            <dl className="grid max-w-lg grid-cols-3 gap-4 pt-4 text-center sm:text-left">
              {[
                { k: "Skills", v: "7+", d: "seed catalog" },
                { k: "Roles", v: "3", d: "customer · worker · admin" },
                { k: "Flow", v: "End-to-end", d: "request → review" }
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.k}</dt>
                  <dd className="mt-1 text-lg font-bold text-foreground">{s.v}</dd>
                  <p className="text-[11px] text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative lg:justify-self-end"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/20 via-violet-500/10 to-cyan-500/15 blur-2xl" />
            <Card className="relative overflow-hidden rounded-3xl border-gradient shadow-glow">
              <CardHeader className="space-y-1 border-b border-border/50 bg-muted/30 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Live preview</CardTitle>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Responsive
                  </span>
                </div>
                <CardDescription>What you get inside the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {[
                  { icon: Users, t: "Role dashboards", d: "Customer, worker, and admin experiences tuned for clarity." },
                  { icon: Sparkles, t: "AI where it helps", d: "Assistant, recommendations, and profile suggestions." },
                  { icon: Shield, t: "Trust layer", d: "Verification queue, complaints, and ratings after jobs." }
                ].map((row) => (
                  <div
                    key={row.t}
                    className="flex gap-4 rounded-2xl border border-border/50 bg-background/60 p-4 transition hover:border-brand/30"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <row.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{row.t}</p>
                      <p className="mt-1 text-sm leading-snug text-muted-foreground">{row.d}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="border-y border-border/60 bg-card/40 py-16 backdrop-blur-sm md:rounded-3xl md:border md:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Built for the way work actually happens</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Fast screens, readable typography, and motion that guides — not distracts.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Snappy UX", desc: "Optimistic flows, clear states, mobile-first navigation." },
              { icon: Clock, title: "Job lifecycle", desc: "Requested → accepted → in progress → done." },
              { icon: MessageCircle, title: "Human + AI", desc: "Support chat with sensible fallbacks." },
              { icon: TrendingUp, title: "Grow trust", desc: "Reviews and admin oversight keep quality high." }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.06 * i }}
              >
                <Card className="h-full rounded-2xl border-border/70 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
              <p className="mt-3 text-muted-foreground">
                Three calm steps from signup to your first completed job.
              </p>
            </div>
            <ol className="space-y-4 lg:col-span-2">
              {[
                {
                  step: "01",
                  title: "Create your space",
                  body: "Register as customer or worker. Workers add skills, rates, and service areas."
                },
                {
                  step: "02",
                  title: "Match & request",
                  body: "Search profiles, use AI suggestions, and send structured job requests with budget."
                },
                {
                  step: "03",
                  title: "Deliver & rate",
                  body: "Track status updates, complete work, and leave a review to grow community trust."
                }
              ].map((s, i) => (
                <motion.li
                  key={s.step}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                  className="flex gap-5 rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white shadow-md">
                    {s.step}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-brand/25 bg-gradient-to-br from-brand/90 via-brand to-violet-600 px-6 py-14 text-center text-white shadow-glow md:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <BadgeCheck className="mx-auto h-10 w-10 opacity-90" />
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready for a calmer hiring flow?</h2>
            <p className="text-base text-white/85 md:text-lg">
              Join as a customer to book talent, or as a worker to grow your daily pipeline — same polished experience.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="rounded-xl px-8 text-base font-semibold text-brand">
                  Create free account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/40 bg-white/10 px-6 text-base text-white backdrop-blur hover:bg-white/20"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
