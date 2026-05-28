import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/dashboard/StatCard";
import { Sparkles, AlertTriangle, MapPin, ClipboardList, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recommendations")({
  component: RecsPage,
  head: () => ({ meta: [{ title: "AI Coach — PrepPilot AI" }] }),
});

function RecsPage() {
  const recs = useQuery({ queryKey: ["recs"], queryFn: () => problemsApi.recommendations().catch(() => ({})) });
  const topic = useQuery({ queryKey: ["topic-progress"], queryFn: () => problemsApi.topicProgress().catch(() => ({})) });
  const readiness = useQuery({ queryKey: ["readiness"], queryFn: () => problemsApi.readiness().catch(() => ({})) });

  const list = normalize(recs.data);
  const weakTopics = normalizeWeak(topic.data);
  const score = Math.round(readiness.data?.readiness_score ?? readiness.data?.score ?? 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="AI Coach" subtitle="Personalized recommendations, weakness detection, and a smart roadmap." />

      <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <Sparkles className="h-7 w-7 text-background" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Placement Readiness</div>
            <div className="text-3xl font-bold gradient-text">{score}%</div>
            <div className="text-sm text-muted-foreground">
              {score >= 80 ? "You're interview-ready. Focus on system design + behavioral." :
               score >= 50 ? "Strong base. Push hard problems and contests now." :
               "Build the basics: arrays, strings, hashmaps, two pointers."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Suggested Problems</h3>
          <div className="space-y-2">
            {list.length ? list.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-card/40 border border-border">
                <div className="text-sm font-medium">{r.title}</div>
                {r.sub && <div className="text-xs text-muted-foreground mt-0.5">{r.sub}</div>}
              </div>
            )) : <EmptyState title="Sync a platform to unlock AI suggestions" icon={Sparkles} />}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Weakness Detection</h3>
          <div className="space-y-3">
            {weakTopics.length ? weakTopics.map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-xs mb-1.5"><span>{t.name}</span><span className="text-muted-foreground">{t.value}%</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.value}%`, background: "linear-gradient(90deg, oklch(0.70 0.20 25), oklch(0.75 0.18 80))" }} />
                </div>
              </div>
            )) : <div className="text-sm text-muted-foreground">No weak spots detected yet.</div>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Suggested Roadmap</h3>
          <ol className="space-y-3">
            {[
              "Master Arrays, Strings, HashMaps (Easy → Medium)",
              "Trees, Graphs & Recursion fundamentals",
              "Dynamic Programming patterns",
              "Greedy + Sliding Window + Two Pointers",
              "Contest practice (CF Div 3 → Div 2)",
              "Mock interviews + system design basics",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 h-7 w-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i+1}</span>
                <div className="text-sm pt-1">{step}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Smart Practice Plan</h3>
          <div className="space-y-2">
            {["Mon — 2 Mediums (Arrays)", "Tue — 1 Hard (DP)", "Wed — 3 Easy (Strings)", "Thu — Contest", "Fri — Trees & Graphs", "Sat — Mock interview", "Sun — Review + revise"].map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-card/40 border border-border">
                <div className="h-7 w-7 rounded-md bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{d.slice(0,3)}</div>
                <div className="text-sm">{d.split(" — ")[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Interview Preparation Tracker</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { k: "DSA", v: Math.min(100, score + 5) },
            { k: "CP", v: Math.max(0, score - 10) },
            { k: "System Design", v: Math.max(0, score - 25) },
            { k: "Behavioral", v: Math.max(0, score - 15) },
          ].map((c) => (
            <div key={c.k} className="p-4 rounded-xl bg-card/40 border border-border">
              <div className="flex justify-between text-xs mb-2"><span>{c.k}</span><span className="text-muted-foreground">{c.v}%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full" style={{ width: `${c.v}%`, background: "var(--gradient-hero)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function normalize(r: any) {
  const arr = r?.recommendations || r?.data || r?.questions || [];
  if (Array.isArray(arr)) return arr.map((x: any) => ({
    title: typeof x === "string" ? x : x.title || x.name || x.message || "Suggestion",
    sub: typeof x === "object" ? x.reason || x.topic || x.difficulty : undefined,
  }));
  return [];
}
function normalizeWeak(t: any) {
  const arr = t?.topic_progress || t?.topics || t?.data || [];
  let list = Array.isArray(arr) ? arr.map((x: any) => ({
    name: x.topic || x.name || "Topic",
    value: Math.min(100, Math.round(x.percentage ?? x.percent ?? (x.solved && x.total ? (x.solved/x.total)*100 : x.value ?? 0))),
  })) : [];
  return list.sort((a, b) => a.value - b.value).slice(0, 5);
}