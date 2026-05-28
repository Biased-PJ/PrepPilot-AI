import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { PageHeader, StatCard } from "@/components/dashboard/StatCard";
import { Flame, Target, CheckCircle2, Mail, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — PrepPilot AI" }] }),
});

function ProfilePage() {
  const { user } = useAuth();
  const streak = useQuery({ queryKey: ["streak"], queryFn: () => problemsApi.streak().catch(() => ({})) });
  const readiness = useQuery({ queryKey: ["readiness"], queryFn: () => problemsApi.readiness().catch(() => ({})) });
  const my = useQuery({ queryKey: ["my-problems"], queryFn: () => problemsApi.myProblems().catch(() => ({})) });

  const solved = (my.data?.problems || my.data?.data || []).length;
  const score = Math.round(readiness.data?.readiness_score ?? readiness.data?.score ?? 0);
  const cur = streak.data?.current_streak ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Profile" />

      <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-background"
            style={{ background: "var(--gradient-hero)" }}>
            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name || user?.email?.split("@")[0]}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Member</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Solved" value={solved} icon={CheckCircle2} accent="var(--chart-4)" />
        <StatCard label="Streak" value={`${cur}🔥`} icon={Flame} accent="var(--brand-leetcode)" />
        <StatCard label="Readiness" value={`${score}%`} icon={Target} accent="var(--chart-5)" />
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Recently Solved</h3>
        <div className="space-y-2">
          {(my.data?.problems || my.data?.data || []).slice(0, 10).map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div className="flex-1 text-sm">{p.title || p.name || `Problem ${i+1}`}</div>
              <span className="text-xs text-muted-foreground">{p.difficulty || ""}</span>
            </div>
          ))}
          {!(my.data?.problems || my.data?.data || []).length && (
            <div className="text-sm text-muted-foreground text-center py-6">No solved problems yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}