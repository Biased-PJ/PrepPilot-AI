"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  difficulty: "EASY" | "MEDIUM" | "HARD";
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

  // Database driven pagination states
  const [page, setPage] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const perPage = 20; // 20 per page feels much cleaner for a pool of 4,000

  // 📡 Fetch live data directly from your local Flask API when pages or filters shift
  useEffect(() => {
    async function fetchLiveProblems() {
      setLoading(true);
      try {
        // Construct standard query parameters dynamically
        let url = `http://localhost:5000/api/problems?page=${page}&limit=${perPage}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (diff.length === 1) url += `&difficulty=${diff[0].toUpperCase()}`; // Matches Flask formatting

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          // Map incoming MongoDB schema properties safely onto client visual props
          const formatted = data.problems.map((p: any) => ({
            id: p.id,
            title: p.title,
            title_slug: p.title_slug,
            platform: p.platform || "LeetCode", // Default layout assignment fallback
            difficulty: p.difficulty,
            topic: p.topic,
            tags: p.tags,
            solved: p.solved || false,
            bookmarked: p.bookmarked || false,
            company: p.company || "N/A",
          }));

          setProblems(formatted);
          setTotalProblems(data.total_problems); // This will set your "3948" count dynamically!
        }
      } catch (err) {
        console.error("❌ Failed to contact backend data stream:", err);
      } finally {
        setLoading(false);
      }
    }

    // Bounce delay mechanism to prevent hammering backend on every single keyboard letter stroke
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
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
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
          {totalProblems} total questions locked inside database &middot;{" "}
          {problems.filter((p) => p.solved).length} solved here
        </p>
      </motion.div>

      {/* Search + filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/20" />
          <Input
            placeholder="Search active live index database..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-9 text-[13px] rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Difficulty pills */}
          {["Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => toggle(diff, d, setDiff)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${diff.includes(d) ? diffColor[d.toUpperCase()] : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]"}`}
            >
              {d}
            </button>
          ))}
          <div className="w-px h-6 bg-white/[0.06] mx-1" />
          {["LeetCode", "Codeforces", "CodeChef"].map((p) => (
            <button
              key={p}
              onClick={() => toggle(plat, p, setPlat)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${plat.includes(p) ? platformColor[p] : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]"}`}
            >
              {p}
            </button>
          ))}

          {(diff.length > 0 || plat.length > 0) && (
            <button
              onClick={() => {
                setDiff([]);
                setPlat([]);
                setPage(1);
              }}
              className="px-2 py-1 text-[12px] text-white/30 hover:text-white/60 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Problem list handling state logic */}
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
              Querying global MongoDB indexes...
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
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${diffColor[p.difficulty]}`}
                  >
                    {p.difficulty}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${platformColor[p.platform]}`}
                  >
                    {p.platform}
                  </span>
                  {p.tags.slice(0, 4).map((t) => (
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

      {/* Dynamic database scale pagination tracker */}
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

            {/* Display close context pagination window */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = page <= 3 ? i + 1 : page - 3 + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`h-7 px-2.5 text-[12px] ${pageNum === page ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : ""}`}
                >
                  {pageNum}
                </Button>
              );
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
