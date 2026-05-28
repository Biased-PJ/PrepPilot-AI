import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";
import { PageHeader, Skeleton, EmptyState } from "@/components/dashboard/StatCard";
import { Search, BookmarkPlus, CheckCircle2, Circle, ExternalLink, Filter, Code2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/problems")({
  component: ProblemsPage,
  head: () => ({ meta: [{ title: "Problems — PrepPilot AI" }] }),
});

const PAGE_SIZE = 20;

function ProblemsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [topic, setTopic] = useState<string | undefined>();
  const [platform, setPlatform] = useState<string | undefined>();
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set());

  const qc = useQueryClient();

  const all = useQuery({
    queryKey: ["problems", { page, search, difficulty, topic, platform }],
    queryFn: () =>
      problemsApi.all({ page, limit: PAGE_SIZE, search: search || undefined, difficulty, topic, platform })
        .catch(() => ({ questions: [] })),
  });
  const my = useQuery({ queryKey: ["my-problems"], queryFn: () => problemsApi.myProblems().catch(() => ({})) });
  const topics = useQuery({ queryKey: ["topics"], queryFn: () => problemsApi.topics().catch(() => ({})) });

  const list: any[] = useMemo(() => {
    const d: any = all.data;
    return d?.questions || d?.data || d?.results || [];
  }, [all.data]);

  const solvedIds = useMemo(() => {
    const arr = my.data?.problems || my.data?.data || [];
    return new Set<string>(arr.map((p: any) => String(p._id || p.question_id || p.id)));
  }, [my.data]);

  const topicOptions: string[] = useMemo(() => {
    const t = topics.data?.topics || topics.data?.data || [];
    return Array.isArray(t) ? t.map(String) : [];
  }, [topics.data]);

  const solveM = useMutation({
    mutationFn: (q: any) => problemsApi.solve({ question_id: q._id || q.id, title: q.title, difficulty: q.difficulty, topic: q.topic }),
    onSuccess: () => { toast.success("Marked as solved 🎉"); qc.invalidateQueries({ queryKey: ["my-problems"] }); },
    onError: () => toast.error("Could not save"),
  });
  const unsolveM = useMutation({
    mutationFn: (id: string) => problemsApi.unsolve(id),
    onSuccess: () => { toast.success("Unmarked"); qc.invalidateQueries({ queryKey: ["my-problems"] }); },
    onError: () => toast.error("Could not update"),
  });

  const toggleBookmark = (id: string) => {
    setBookmarks((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      toast.success(next.has(id) ? "Bookmarked" : "Removed bookmark");
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Problems" subtitle="Curated DSA + CP problem bank with smart filters." />

      <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, topic, company…" className="pl-9 bg-card/40" />
        </div>
        <Select value={difficulty} onChange={setDifficulty} options={["Easy","Medium","Hard"]} placeholder="Difficulty" />
        <Select value={topic} onChange={setTopic} options={topicOptions.length ? topicOptions : ["Arrays","Strings","Trees","DP","Graphs"]} placeholder="Topic" />
        <Select value={platform} onChange={setPlatform} options={["leetcode","codeforces","codechef"]} placeholder="Platform" />
        {(difficulty || topic || platform || search) && (
          <Button variant="ghost" onClick={() => { setDifficulty(undefined); setTopic(undefined); setPlatform(undefined); setSearch(""); }}>
            <Filter className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {all.isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !list.length ? (
        <EmptyState title="No problems found" desc="Try clearing filters or syncing a platform." icon={Code2} />
      ) : (
        <div className="grid gap-3">
          {list.map((q: any) => {
            const id = String(q._id || q.id || q.question_id);
            const solved = solvedIds.has(id);
            const tags: string[] = q.companies || q.company_tags || [];
            return (
              <div key={id} className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.005] transition group">
                <button onClick={() => solved ? unsolveM.mutate(id) : solveM.mutate(q)}
                  className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center border border-border hover:border-primary transition">
                  {solved
                    ? <CheckCircle2 className="h-5 w-5 text-primary" />
                    : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{q.title || q.name || "Untitled"}</h3>
                    <DifficultyPill d={q.difficulty} />
                    {q.platform && <PlatformPill p={q.platform} />}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    {(q.topics || (q.topic ? [q.topic] : [])).slice(0, 4).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                    ))}
                    {tags.slice(0, 3).map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full border border-border text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => toggleBookmark(id)}
                  className={`p-2 rounded-lg hover:bg-accent transition ${bookmarks.has(id) ? "text-primary" : "text-muted-foreground"}`}>
                  <BookmarkPlus className="h-4 w-4" />
                </button>
                {q.url && (
                  <a href={q.url} target="_blank" rel="noreferrer"
                    className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground px-3">Page {page}</span>
        <Button variant="outline" disabled={list.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: { value?: string; onChange: (v: string | undefined) => void; options: string[]; placeholder: string }) {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value || undefined)}
      className="h-9 px-3 rounded-md bg-card/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary capitalize">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function DifficultyPill({ d }: { d?: string }) {
  if (!d) return null;
  const map: Record<string, string> = {
    Easy: "oklch(0.75 0.18 160)",
    Medium: "oklch(0.75 0.18 80)",
    Hard: "oklch(0.70 0.20 25)",
  };
  const k = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
  const c = map[k] || "var(--muted-foreground)";
  return <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `color-mix(in oklch, ${c} 20%, transparent)`, color: c }}>{k}</span>;
}
function PlatformPill({ p }: { p: string }) {
  const map: Record<string, string> = {
    leetcode: "oklch(0.75 0.18 50)",
    codeforces: "oklch(0.70 0.18 245)",
    codechef: "oklch(0.55 0.12 50)",
  };
  const c = map[p.toLowerCase()] || "var(--muted-foreground)";
  return <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: `color-mix(in oklch, ${c} 18%, transparent)`, color: c }}>{p}</span>;
}