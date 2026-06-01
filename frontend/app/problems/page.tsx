"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { problemsAPI } from "@/lib/api"; // 🟢 Added clean relative library path match block hook
import {
  Search,
  BookmarkIcon,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Problem {
  id: string;
  title: string;
  title_slug: string;
  platform: string;
  difficulty: string;
  topic: string;
  tags: string[];
  solved: boolean;
  bookmarked: boolean;
  company: string;
}

const diffColor: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MEDIUM: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  HARD: "bg-red-500/10 text-red-400 border-red-500/20",
};

const platformColor: Record<string, string> = {
  LeetCode: "bg-orange-500/10 text-orange-400/70",
  Codeforces: "bg-blue-500/10 text-blue-400/70",
  CodeChef: "bg-amber-500/10 text-amber-400/70",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState<string[]>([]);
  const [plat, setPlat] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const perPage = 20;

  useEffect(() => {
    async function fetchLiveProblems() {
      setLoading(true);
      try {
        // 🟢 FIXED: Using central problemsAPI module instead of manual hardcoded fetch loops
        const response = await problemsAPI.getProblems(page, perPage, {
          search: search.trim() || undefined,
          difficulty: diff.length === 1 ? diff[0].toUpperCase() : undefined,
          platform: plat.length === 1 ? plat[0] : undefined,
        });

        const data = response.data;
        console.log("🔍 API Response Payload JSON:", data);

        if (
          data &&
          (data.questions || data.problems || Array.isArray(data.data))
        ) {
          const rawQuestions =
            data.questions || data.problems || data.data || [];
          const totalCount =
            data.total_questions ?? data.total_problems ?? data.total ?? 0;
          const solvedCountFromBackend =
            data.total_solved ??
            data.solved_count ??
            data.total_questions_solved ??
            0;

          const formatted = rawQuestions.map((p: any) => ({
            id:
              p.id ||
              p.question_id ||
              p._id?.toString() ||
              String(Math.random()),
            title: p.title || "Untitled Problem",
            title_slug: p.slug || p.title_slug || "",
            platform: p.platform || "LeetCode",
            difficulty: (p.difficulty || "EASY").toUpperCase(),
            topic: p.topic || "General",
            tags: Array.isArray(p.tags) ? p.tags : [],
            solved: p.solved || false,
            bookmarked: p.bookmarked || false,
            company:
              p.company ||
              (Array.isArray(p.companies) && p.companies.length > 0
                ? p.companies[0]
                : "N/A"),
          }));

          setProblems(formatted);
          setTotalProblems(totalCount);
          setSolvedCount(solvedCountFromBackend);
        } else {
          setProblems([]);
          setTotalProblems(0);
          console.error("⚠️ Response missing payload structures:", data);
        }
      } catch (err) {
        console.error("❌ Failed to contact backend data stream:", err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchLiveProblems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, search, diff, plat]);

  const totalPages = Math.ceil(totalProblems / perPage);

  const toggle = (
    arr: string[],
    val: string,
    setter: (v: string[]) => void,
  ) => {
    setter(arr.includes(val) ? [] : [val]);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
        <p className="text-[14px] text-white/40 mt-1">
          {totalProblems} problems &middot; {solvedCount} solved
        </p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/20" />
          <Input
            placeholder="Search questions, topics, or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-9 text-[13px] rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => toggle(diff, d, setDiff)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${
                diff.includes(d)
                  ? diffColor[d.toUpperCase()]
                  : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {d}
            </button>
          ))}
          <div className="w-px h-6 bg-white/[0.06] mx-1" />
          {["LeetCode", "Codeforces", "CodeChef"].map((p) => (
            <button
              key={p}
              onClick={() => toggle(plat, p, setPlat)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${
                plat.includes(p)
                  ? platformColor[p]
                  : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {p}
            </button>
          ))}

          {(diff.length > 0 || plat.length > 0 || search.length > 0) && (
            <button
              onClick={() => {
                setDiff([]);
                setPlat([]);
                setSearch("");
                setPage(1);
              }}
              className="px-2 py-1 text-[12px] text-white/30 hover:text-white/60 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Container Wrapper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl overflow-hidden divide-y divide-white/[0.04] min-h-[200px] flex flex-col justify-center"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12 text-white/40 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
            <span className="text-[13px]">
              Querying application clusters...
            </span>
          </div>
        ) : problems.length > 0 ? (
          problems.map((p) => (
            <div
              key={p.id}
              className="p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-3 group"
            >
              <div className="pt-0.5 flex-shrink-0">
                {p.solved ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border border-white/[0.1]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-[14px] font-medium group-hover:text-orange-400 transition-colors truncate">
                    {p.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${diffColor[p.difficulty] || diffColor["EASY"]}`}
                  >
                    {p.difficulty}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${platformColor[p.platform] || platformColor["LeetCode"]}`}
                  >
                    {p.platform}
                  </span>
                  {p.tags &&
                    p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.03] text-white/20"
                      >
                        {t}
                      </span>
                    ))}
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-white/[0.04] flex-shrink-0">
                <BookmarkIcon
                  className={`w-4 h-4 ${p.bookmarked ? "fill-orange-400 text-orange-400" : "text-white/15"}`}
                />
              </button>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-white/20 text-[14px]">
            No problems found matching active database filter set
          </div>
        )}
      </motion.div>

      {/* Pagination Logic */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-white/30">
          <span>
            Showing {(page - 1) * perPage + 1}-
            {Math.min(page * perPage, totalProblems)} of {totalProblems}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="h-7 px-2 text-[12px]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (pageNum) =>
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - page) <= 1,
              )
              .map((pageNum, idx, arr) => {
                const elements = [];
                if (idx > 0 && pageNum - arr[idx - 1] > 1) {
                  elements.push(
                    <span
                      key={`ellipsis-${pageNum}`}
                      className="px-1 text-white/10"
                    >
                      ...
                    </span>,
                  );
                }
                elements.push(
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-7 px-2.5 text-[12px] ${pageNum === page ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : ""}`}
                  >
                    {pageNum}
                  </Button>,
                );
                return elements;
              })}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="h-7 px-2 text-[12px]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
