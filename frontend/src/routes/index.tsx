import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Trophy, TrendingUp, Brain, Zap, Target,
  Code2, BarChart3, Flame, ArrowRight, Github, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrepPilot AI — Crack Placements with AI Coding Analytics" },
      { name: "description", content: "Unified LeetCode, Codeforces & CodeChef analytics. AI recommendations, readiness score, and a roadmap to your dream offer." },
      { property: "og:title", content: "PrepPilot AI" },
      { property: "og:description", content: "AI-powered placement preparation platform." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Brain, title: "AI Recommendations", desc: "Personalized problem suggestions based on your weak topics and goals." },
  { icon: Target, title: "Readiness Score", desc: "Know exactly how placement-ready you are across DSA, CP, and interview rounds." },
  { icon: Flame, title: "Streaks & Habits", desc: "Build a daily coding habit with streak tracking and activity heatmaps." },
  { icon: BarChart3, title: "Unified Analytics", desc: "All your stats from LeetCode, Codeforces & CodeChef in one dashboard." },
  { icon: Trophy, title: "Leaderboards", desc: "Compete with peers and track your global and friend rankings." },
  { icon: Zap, title: "Smart Roadmap", desc: "AI-generated study plans that adapt to your progress in real time." },
];

const stats = [
  { label: "Problems Indexed", value: "12,000+" },
  { label: "Platforms Synced", value: "3" },
  { label: "AI Models", value: "Live" },
  { label: "Avg. Readiness Lift", value: "+42%" },
];

const testimonials = [
  { name: "Aarav S.", role: "SDE Intern @ Stripe", quote: "PrepPilot's readiness score was scary accurate. Cracked 4 placements in one season." },
  { name: "Divya P.", role: "Microsoft New Grad", quote: "Finally one place for LeetCode, CF and CodeChef. The AI roadmap is gold." },
  { name: "Rohit K.", role: "ICPC Regionalist", quote: "Best CP analytics tool I've used. The topic mastery breakdown is unmatched." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-hero)" }} />

      {/* Navbar */}
      <header className="relative z-10 sticky top-0 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <span className="font-bold tracking-tight">PrepPilot<span className="gradient-text"> AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition">Testimonials</a>
            <a href="#stats" className="hover:text-foreground transition">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          New · AI Readiness Engine v2
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          Crack placements with<br />
          <span className="gradient-text">AI-powered clarity</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          One dashboard for LeetCode, Codeforces & CodeChef. Get a personalized roadmap, weakness detection,
          and a real-time readiness score that maps to your dream offer.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 glow">
              Start free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="glass">
              <Github className="mr-2 h-4 w-4" /> Sign in
            </Button>
          </Link>
        </motion.div>

        {/* Hero preview card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 mx-auto max-w-5xl relative">
          <div className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative glass-strong rounded-2xl p-6 card-elevated">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: "Total Solved", v: "847", c: "var(--chart-4)" },
                { l: "Readiness", v: "78%", c: "var(--chart-5)" },
                { l: "Streak", v: "42 🔥", c: "var(--brand-leetcode)" },
                { l: "Rating", v: "1820", c: "var(--brand-codeforces)" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl p-4 bg-card/60 border border-border">
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: s.c as string }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 49 }).map((_, i) => {
                const intensity = Math.random();
                return <div key={i} className="aspect-square rounded-sm"
                  style={{ background: `oklch(0.72 0.20 285 / ${0.08 + intensity * 0.6})` }} />;
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to <span className="gradient-text">ship offers</span></h2>
          <p className="mt-4 text-muted-foreground">Built for serious students, by people who shipped at FAANG.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:scale-[1.02] transition group">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-4 group-hover:glow transition"
                style={{ background: "var(--gradient-hero)" }}>
                <f.icon className="h-5 w-5 text-background" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">Loved by <span className="gradient-text">future engineers</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6">
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full" style={{ background: "var(--gradient-hero)" }} />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <h2 className="text-4xl font-bold">Your dream offer is one streak away.</h2>
            <p className="mt-3 text-muted-foreground">Join thousands of students sharpening their edge with PrepPilot.</p>
            <Link to="/signup">
              <Button size="lg" className="mt-6 bg-foreground text-background hover:opacity-90">
                Get started — it's free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
              {["No credit card", "All 3 platforms", "AI included"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <span>© {new Date().getFullYear()} PrepPilot AI</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
