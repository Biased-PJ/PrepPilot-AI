import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/StatCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, RefreshCw, Trash2, Plug } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/integrations")({
  component: IntegrationsPage,
  head: () => ({ meta: [{ title: "Integrations — PrepPilot AI" }] }),
});

const platforms = [
  { key: "leetcode" as const, name: "LeetCode", color: "oklch(0.75 0.18 50)", placeholder: "your LeetCode username" },
  { key: "codeforces" as const, name: "Codeforces", color: "oklch(0.70 0.18 245)", placeholder: "your Codeforces handle" },
  { key: "codechef" as const, name: "CodeChef", color: "oklch(0.55 0.12 50)", placeholder: "your CodeChef username" },
];

function IntegrationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Platform Integrations" subtitle="Connect your coding accounts to unify analytics." />
      <div className="grid gap-4">
        {platforms.map((p) => (
          <PlatformCard key={p.key} pKey={p.key} name={p.name} color={p.color} placeholder={p.placeholder} />
        ))}
      </div>
    </div>
  );
}

function PlatformCard({ pKey, name, color, placeholder }: { pKey: "leetcode"|"codeforces"|"codechef"; name: string; color: string; placeholder: string }) {
  const api = platformApi[pKey];
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: [pKey, "profile"], queryFn: () => api.profile().catch(() => ({ success: false })) });
  const [handle, setHandle] = useState("");

  const connected = profile.data?.success;
  const data: any = profile.data?.profile || profile.data?.data || {};

  const startM = useMutation({
    mutationFn: () => api.start(handle),
    onSuccess: (r) => toast.success(r?.message || `Verification started for ${name}`),
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });
  const verifyM = useMutation({
    mutationFn: () => api.verify(),
    onSuccess: (r) => { toast.success(r?.message || "Verified!"); qc.invalidateQueries({ queryKey: [pKey, "profile"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Verification failed"),
  });
  const syncM = useMutation({
    mutationFn: () => api.sync(),
    onSuccess: () => { toast.success(`${name} synced`); qc.invalidateQueries({ queryKey: [pKey, "profile"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Sync failed"),
  });
  const removeM = useMutation({
    mutationFn: () => api.remove(),
    onSuccess: () => { toast.success(`${name} disconnected`); qc.invalidateQueries({ queryKey: [pKey, "profile"] }); },
  });

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30" style={{ background: color }} />
      <div className="relative flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-background font-bold" style={{ background: color }}>
          {name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{name}</h3>
            {connected && (
              <span className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: `color-mix(in oklch, ${color} 18%, transparent)`, color }}>
                <CheckCircle2 className="h-3 w-3" /> Connected
              </span>
            )}
          </div>

          {profile.isLoading ? (
            <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Checking…</div>
          ) : connected ? (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <Info label="Handle" value={data.username || data.handle || data.user_name || "—"} />
                <Info label="Solved" value={data.solved ?? data.totalSolved ?? data.problems_solved ?? "—"} />
                <Info label={pKey === "codeforces" ? "Rating" : "Score"} value={data.rating ?? data.score ?? "—"} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => syncM.mutate()} disabled={syncM.isPending} className="bg-primary text-primary-foreground hover:opacity-90">
                  {syncM.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />} Sync now
                </Button>
                <Button size="sm" variant="outline" onClick={() => removeM.mutate()}>
                  <Trash2 className="h-3 w-3 mr-1" /> Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder={placeholder} className="bg-card/40" />
                <Button onClick={() => startM.mutate()} disabled={!handle || startM.isPending}>
                  {startM.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plug className="h-3 w-3 mr-1" />} Start
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">After starting, follow the in-app instructions to add a verification snippet to your profile, then click verify.</p>
              <Button size="sm" variant="outline" onClick={() => verifyM.mutate()} disabled={verifyM.isPending}>
                {verifyM.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />} Verify
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 rounded-lg bg-card/40 border border-border">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-semibold mt-0.5 truncate">{String(value)}</div>
    </div>
  );
}