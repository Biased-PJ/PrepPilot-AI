import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/dashboard/StatCard";
import { Trophy, Crown, Medal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  component: LeaderboardPage,
  head: () => ({ meta: [{ title: "Leaderboard — PrepPilot AI" }] }),
});

function LeaderboardPage() {
  const q = useQuery({ queryKey: ["leaderboard"], queryFn: () => problemsApi.leaderboard().catch(() => ({})) });
  const arr: any[] = q.data?.leaderboard || q.data?.data || q.data?.users || [];
  const top3 = arr.slice(0, 3);
  const rest = arr.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Leaderboard" subtitle="Top performers across PrepPilot AI." />

      {!arr.length ? (
        <EmptyState title="No rankings yet" desc="Be the first to top the board — solve some problems!" icon={Trophy} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {top3.map((u, i) => (
              <div key={i} className={`glass rounded-2xl p-5 text-center relative overflow-hidden ${i === 0 ? "lg:scale-110" : ""}`}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full blur-3xl opacity-40"
                  style={{ background: i === 0 ? "oklch(0.85 0.18 90)" : i === 1 ? "oklch(0.85 0 0)" : "oklch(0.65 0.15 50)" }} />
                <div className="relative">
                  <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--gradient-hero)" }}>
                    {i === 0 ? <Crown className="h-5 w-5 text-background" /> : <Medal className="h-5 w-5 text-background" />}
                  </div>
                  <div className="mt-3 font-semibold text-sm truncate">{u.name || u.email?.split("@")[0]}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="mt-2 text-2xl font-bold gradient-text">{u.score ?? u.solved ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">#{i+1}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl divide-y divide-border">
            {rest.map((u, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-accent/30 transition">
                <div className="w-8 text-center text-sm font-bold text-muted-foreground">{i + 4}</div>
                <div className="h-9 w-9 rounded-full" style={{ background: "var(--gradient-hero)" }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{u.name || u.email?.split("@")[0]}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <div className="text-sm font-semibold">{u.score ?? u.solved ?? 0}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}