import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { StatCard, PageHeader, Skeleton, EmptyState } from "@/components/dashboard/StatCard";
import {
  Target, Flame, CheckCircle2, TrendingUp, Sparkles, Trophy, Plug,
} from "lucide-react";
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — PrepPilot AI" }] }),
});

function Dashboard() {
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => problemsApi.dashboard().catch(() => ({})) });
  const streak = useQuery({ queryKey: ["streak"], queryFn: () => problemsApi.streak().catch(() => ({})) });
  const readiness = useQuery({ queryKey: ["readiness"], queryFn: () => problemsApi.readiness().catch(() => ({})) });
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: () => problemsApi.analytics().catch(() => ({})) });
  const topic = useQuery({ queryKey: ["topic-progress"], queryFn: () => problemsApi.topicProgress().catch(() => ({})) });
  const daily = useQuery({ queryKey: ["daily"], queryFn: () => problemsApi.daily().catch(() => ({})) });
  const recs = useQuery({ queryKey: ["recs"], queryFn: () => problemsApi.recommendations().catch(() => ({})) });
  const leaders = useQuery({ queryKey: ["leaderboard"], queryFn: () => problemsApi.leaderboard().catch(() => ({})) });

  const d: any = dash.data?.dashboard || dash.data || {};
  const totalSolved = d.total_solved ?? d.totalSolved ?? d.solved_count ?? 0;
  const readinessScore = Math.round(readiness.data?.readiness_score ?? readiness.data?.score ?? d.readiness_score ?? 0);
  const currentStreak = streak.data?.current_streak ?? streak.data?.streak ?? 0;
  const longestStreak = streak.data?.longest_streak ?? 0;

  const diffData = normalizeDifficulty(analytics.data || d);
  const topicData = normalizeTopics(topic.data || analytics.data);
  const platformData = normalizePlatforms(d);
  const trendData = normalizeTrend(analytics.data);

  const dailyQ: any = daily.data?.question || daily.data?.data || daily.data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Welcome back 👋"
        subtitle="Here's your placement readiness snapshot."
        action={
          <Link to="/integrations">
            <button className="text-sm px-3 py-2 rounded-lg glass hover:bg-accent inline-flex items-center gap-2">
              <Plug className="h-4 w-4" /> Connect platforms
            </button>
          </Link>
        }
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Solved" value={totalSolved} icon={CheckCircle2} accent="var(--chart-4)" sub="all platforms" />
        <StatCard label="Readiness" value={`${readinessScore}%`} icon={Target} accent="var(--chart-5)" sub="placement ready" />
        <StatCard label="Current Streak" value={`${currentStreak}🔥`} icon={Flame} accent="var(--brand-leetcode)" sub={`best ${longestStreak}d`} />
        <StatCard label="Rating" value={d.codeforces_rating || d.rating || "—"} icon={TrendingUp} accent="var(--brand-codeforces)" sub="codeforces" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Readiness gauge */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Readiness Score</h3>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: readinessScore, fill: "url(#grad1)" }]} startAngle={90} endAngle={-270}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.20 285)" />
                    <stop offset="100%" stopColor="oklch(0.70 0.18 245)" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "oklch(1 0 0 / 0.06)" }} dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-32 mb-12">
            <div className="text-4xl font-bold gradient-text">{readinessScore}%</div>
            <div className="text-xs text-muted-foreground mt-1">placement ready</div>
          </div>
        </div>

        {/* Difficulty distribution */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Difficulty Breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={diffData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {diffData.map((_, i) => <Cell key={i} fill={["oklch(0.75 0.18 160)","oklch(0.75 0.18 80)","oklch(0.70 0.20 25)"][i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {diffData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: ["oklch(0.75 0.18 160)","oklch(0.75 0.18 80)","oklch(0.70 0.20 25)"][i] }} />
                {d.name}: <b>{d.value}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Platform Activity</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="solved" radius={[8, 8, 0, 0]}>
                  {platformData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trend */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="day" stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 270)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.72 0.20 285)" />
                    <stop offset="100%" stopColor="oklch(0.70 0.18 245)" />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="count" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.72 0.20 285)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily challenge */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> DAILY CHALLENGE
            </div>
            <h3 className="mt-3 font-semibold text-lg">{dailyQ.title || dailyQ.name || "Two Sum"}</h3>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-card border border-border">{dailyQ.difficulty || "Medium"}</span>
              <span className="px-2 py-0.5 rounded-full bg-card border border-border">{dailyQ.topic || dailyQ.topics?.[0] || "Arrays"}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
              {dailyQ.description || "Sharpen your skills with today's hand-picked problem."}
            </p>
            <Link to="/problems">
              <button className="mt-4 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Solve now →
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Topic progress */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Topic Mastery</h3>
          <div className="space-y-3">
            {topicData.slice(0, 6).map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${t.value}%`,
                    background: "var(--gradient-hero)",
                  }} />
                </div>
              </div>
            ))}
            {!topicData.length && <Skeleton className="h-24" />}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> AI Insights</h3>
            <Link to="/recommendations" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {normalizeRecs(recs.data).slice(0, 4).map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-card/40 border border-border text-sm">
                <div className="font-medium">{r.title}</div>
                {r.sub && <div className="text-xs text-muted-foreground mt-0.5">{r.sub}</div>}
              </div>
            ))}
            {!normalizeRecs(recs.data).length && (
              <EmptyState title="No insights yet" desc="Solve a few problems to unlock AI suggestions." icon={Sparkles} />
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard preview */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-primary" /> Leaderboard</h3>
          <Link to="/leaderboard" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {normalizeLeaderboard(leaders.data).slice(0, 5).map((u, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition">
              <div className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</div>
              <div className="h-8 w-8 rounded-full" style={{ background: "var(--gradient-hero)" }} />
              <div className="flex-1">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <div className="text-sm font-semibold">{u.score}</div>
            </div>
          ))}
          {!normalizeLeaderboard(leaders.data).length && <EmptyState title="No leaderboard data yet" icon={Trophy} />}
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.20 0.025 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 };

function normalizeDifficulty(d: any) {
  const diff = d?.difficulty || d?.difficulty_breakdown || d?.analytics?.difficulty || {};
  return [
    { name: "Easy", value: diff.easy ?? diff.Easy ?? 0 },
    { name: "Medium", value: diff.medium ?? diff.Medium ?? 0 },
    { name: "Hard", value: diff.hard ?? diff.Hard ?? 0 },
  ];
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
function normalizePlatforms(d: any) {
  const p = d?.platforms || d?.platform_stats || {};
  return [
    { name: "LeetCode", solved: p.leetcode?.solved ?? p.leetcode ?? 0, color: "oklch(0.75 0.18 50)" },
    { name: "Codeforces", solved: p.codeforces?.solved ?? p.codeforces ?? 0, color: "oklch(0.70 0.18 245)" },
    { name: "CodeChef", solved: p.codechef?.solved ?? p.codechef ?? 0, color: "oklch(0.55 0.12 50)" },
  ];
}
function normalizeTrend(a: any) {
  const arr = a?.weekly || a?.trend || a?.activity || [];
  if (Array.isArray(arr) && arr.length) {
    return arr.map((x: any) => ({ day: x.day || x.date || x.label, count: x.count ?? x.value ?? 0 }));
  }
  return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => ({ day, count: 0 }));
}
function normalizeRecs(r: any): { title: string; sub?: string }[] {
  const arr = r?.recommendations || r?.data || r?.questions || [];
  if (Array.isArray(arr)) {
    return arr.map((x: any) => ({
      title: typeof x === "string" ? x : x.title || x.name || x.message || "Suggestion",
      sub: typeof x === "object" ? x.reason || x.topic || x.difficulty : undefined,
    }));
  }
  return [];
}
function normalizeLeaderboard(l: any): { name: string; email: string; score: number }[] {
  const arr = l?.leaderboard || l?.data || l?.users || [];
  if (Array.isArray(arr)) {
    return arr.map((u: any) => ({
      name: u.name || u.email?.split("@")[0] || "User",
      email: u.email || "",
      score: u.score ?? u.solved ?? u.readiness_score ?? 0,
    }));
  }
  return [];
}