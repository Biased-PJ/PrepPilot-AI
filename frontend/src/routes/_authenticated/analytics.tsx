import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { PageHeader, StatCard } from "@/components/dashboard/StatCard";
import { Target, TrendingUp, Award, Brain } from "lucide-react";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell,
  RadialBarChart, RadialBar,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — PrepPilot AI" }] }),
});

function AnalyticsPage() {
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: () => problemsApi.analytics().catch(() => ({})) });
  const topic = useQuery({ queryKey: ["topic-progress"], queryFn: () => problemsApi.topicProgress().catch(() => ({})) });
  const readiness = useQuery({ queryKey: ["readiness"], queryFn: () => problemsApi.readiness().catch(() => ({})) });
  const recs = useQuery({ queryKey: ["recs"], queryFn: () => problemsApi.recommendations().catch(() => ({})) });

  const a: any = analytics.data || {};
  const score = Math.round(readiness.data?.readiness_score ?? readiness.data?.score ?? 0);

  const topics = normalizeTopics(topic.data || a);
  const radarData = topics.slice(0, 8).map((t) => ({ topic: t.name, A: t.value }));

  const trend = (a.weekly || a.activity || a.trend || []).map((x: any) => ({
    day: x.day || x.date || x.label, count: x.count ?? x.value ?? 0,
  }));

  const diff = a.difficulty || a.difficulty_breakdown || {};
  const diffArr = [
    { name: "Easy", value: diff.easy ?? diff.Easy ?? 0, color: "oklch(0.75 0.18 160)" },
    { name: "Medium", value: diff.medium ?? diff.Medium ?? 0, color: "oklch(0.75 0.18 80)" },
    { name: "Hard", value: diff.hard ?? diff.Hard ?? 0, color: "oklch(0.70 0.20 25)" },
  ];

  const total = diffArr.reduce((s, x) => s + x.value, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Analytics" subtitle="Deep insights across platforms, topics & difficulty." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Solved" value={total || a.total_solved || 0} icon={Award} accent="var(--chart-4)" />
        <StatCard label="Readiness" value={`${score}%`} icon={Target} accent="var(--chart-5)" />
        <StatCard label="Topics Covered" value={topics.length} icon={Brain} accent="var(--brand-leetcode)" />
        <StatCard label="Avg Difficulty" value={avgDiff(diffArr)} icon={TrendingUp} accent="var(--brand-codeforces)" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Topic Mastery Radar</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: "oklch(0.85 0.02 270)" }} />
                <PolarRadiusAxis tick={false} stroke="oklch(1 0 0 / 0.1)" />
                <Radar dataKey="A" stroke="oklch(0.72 0.20 285)" fill="oklch(0.72 0.20 285)" fillOpacity={0.4} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Readiness Gauge</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ value: score, fill: "oklch(0.72 0.20 285)" }]} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "oklch(1 0 0 / 0.06)" }} dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-32">
              <div className="text-5xl font-bold gradient-text">{score}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {score < 30 ? "Just getting started" : score < 60 ? "Building momentum" : score < 85 ? "Interview ready" : "Top tier"}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Problem-Solving Trend</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend.length ? trend : Array.from({length:14}).map((_,i)=>({day:`D${i+1}`,count:0}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="day" stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="oklch(0.72 0.20 285)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Difficulty Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={diffArr}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {diffArr.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-1.5"><Brain className="h-4 w-4 text-primary" /> AI Insights</h3>
          <div className="space-y-2">
            {(normalizeRecs(recs.data).slice(0, 5)).map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-card/40 border border-border text-sm">
                <div className="font-medium">{r.title}</div>
                {r.sub && <div className="text-xs text-muted-foreground mt-0.5">{r.sub}</div>}
              </div>
            ))}
            {!normalizeRecs(recs.data).length && (
              <div className="text-sm text-muted-foreground p-4 text-center">Sync a platform to unlock AI insights.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.20 0.025 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 };

function avgDiff(arr: { name: string; value: number }[]) {
  const weights: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
  const total = arr.reduce((s, x) => s + x.value, 0);
  if (!total) return "—";
  const score = arr.reduce((s, x) => s + x.value * (weights[x.name] || 1), 0) / total;
  if (score < 1.5) return "Easy";
  if (score < 2.3) return "Medium";
  return "Hard";
}
function normalizeTopics(t: any) {
  const arr = t?.topic_progress || t?.topics || t?.data || [];
  if (Array.isArray(arr)) {
    return arr.map((x: any) => ({
      name: x.topic || x.name || "Topic",
      value: Math.min(100, Math.round(x.percentage ?? x.percent ?? (x.solved && x.total ? (x.solved / x.total) * 100 : x.value ?? 0))),
    }));
  }
  if (typeof arr === "object" && arr) {
    return Object.entries(arr).map(([k, v]: any) => ({ name: k, value: Math.min(100, Math.round(typeof v === "number" ? v : v.percentage ?? 0)) }));
  }
  return [];
}
function normalizeRecs(r: any): { title: string; sub?: string }[] {
  const arr = r?.recommendations || r?.data || r?.questions || [];
  if (Array.isArray(arr)) return arr.map((x: any) => ({
    title: typeof x === "string" ? x : x.title || x.name || x.message || "Suggestion",
    sub: typeof x === "object" ? x.reason || x.topic || x.difficulty : undefined,
  }));
  return [];
}