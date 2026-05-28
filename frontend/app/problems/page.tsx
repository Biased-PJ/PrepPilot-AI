'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookmarkIcon, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const mockProblems = [
  { id:1, title:'Two Sum', platform:'LeetCode', difficulty:'Easy', topics:['Array','Hash Table'], solved:true, bookmarked:false, company:'Amazon' },
  { id:2, title:'Add Two Numbers', platform:'LeetCode', difficulty:'Medium', topics:['Linked List','Math'], solved:true, bookmarked:true, company:'Google' },
  { id:3, title:'Longest Substring Without Repeating Characters', platform:'LeetCode', difficulty:'Medium', topics:['Hash Table','String','Sliding Window'], solved:false, bookmarked:true, company:'Microsoft' },
  { id:4, title:'Median of Two Sorted Arrays', platform:'LeetCode', difficulty:'Hard', topics:['Array','Binary Search'], solved:false, bookmarked:false, company:'Google' },
  { id:5, title:'Beautiful Arrangement', platform:'Codeforces', difficulty:'Medium', topics:['Backtracking','Permutation'], solved:true, bookmarked:false, company:'Meta' },
  { id:6, title:'Palindrome Partitioning', platform:'CodeChef', difficulty:'Hard', topics:['Backtracking','DP'], solved:false, bookmarked:true, company:'Amazon' },
  { id:7, title:'Valid Palindrome', platform:'LeetCode', difficulty:'Easy', topics:['String','Two Pointers'], solved:true, bookmarked:false, company:'Meta' },
  { id:8, title:'Integer to Roman', platform:'LeetCode', difficulty:'Medium', topics:['String','Math'], solved:false, bookmarked:false, company:'Microsoft' },
  { id:9, title:'Merge k Sorted Lists', platform:'LeetCode', difficulty:'Hard', topics:['Linked List','Heap'], solved:false, bookmarked:false, company:'Google' },
  { id:10, title:'LRU Cache', platform:'LeetCode', difficulty:'Hard', topics:['Design','Hash Table'], solved:false, bookmarked:true, company:'Amazon' },
];

const diffColor: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const platformColor: Record<string, string> = {
  LeetCode: 'bg-orange-500/10 text-orange-400/70',
  Codeforces: 'bg-blue-500/10 text-blue-400/70',
  CodeChef: 'bg-amber-500/10 text-amber-400/70',
};

export default function ProblemsPage() {
  const [search, setSearch] = useState('');
  const [diff, setDiff] = useState<string[]>([]);
  const [plat, setPlat] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => mockProblems.filter(p =>
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase())) &&
    (diff.length === 0 || diff.includes(p.difficulty)) &&
    (plat.length === 0 || plat.includes(p.platform))
  ), [search, diff, plat]);

  const paged = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length/perPage);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
        <p className="text-[14px] text-white/40 mt-1">{filtered.length} problems &middot; {mockProblems.filter(p=>p.solved).length} solved</p>
      </motion.div>

      {/* Search + filters */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/20" />
          <Input placeholder="Search problems or companies..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-9 text-[13px] rounded-lg" />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Difficulty pills */}
          {['Easy','Medium','Hard'].map(d => (
            <button key={d} onClick={() => toggle(diff, d, setDiff)} className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${diff.includes(d) ? diffColor[d] : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]'}`}>{d}</button>
          ))}
          <div className="w-px h-6 bg-white/[0.06] mx-1" />
          {['LeetCode','Codeforces','CodeChef'].map(p => (
            <button key={p} onClick={() => toggle(plat, p, setPlat)} className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${plat.includes(p) ? platformColor[p] : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]'}`}>{p}</button>
          ))}

          {(diff.length > 0 || plat.length > 0) && (
            <button onClick={() => { setDiff([]); setPlat([]); setPage(1); }} className="px-2 py-1 text-[12px] text-white/30 hover:text-white/60 flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>
          )}
        </div>
      </motion.div>

      {/* Problem list */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }} className="glass rounded-xl overflow-hidden divide-y divide-white/[0.04]">
        {paged.length > 0 ? paged.map((p) => (
          <div key={p.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-3 group">
            <div className="pt-0.5 flex-shrink-0">
              {p.solved ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> : <div className="w-4.5 h-4.5 rounded-full border border-white/[0.1]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-[14px] font-medium group-hover:text-orange-400 transition-colors truncate">{p.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${platformColor[p.platform]}`}>{p.platform}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.03] text-white/25">{p.company}</span>
                {p.topics.map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.03] text-white/20">{t}</span>)}
              </div>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-white/[0.04] flex-shrink-0">
              <BookmarkIcon className={`w-4 h-4 ${p.bookmarked ? 'fill-orange-400 text-orange-400' : 'text-white/15'}`} />
            </button>
          </div>
        )) : (
          <div className="p-12 text-center text-white/20 text-[14px]">No problems found</div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-white/30">
          <span>Showing {(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} className="h-7 px-2 text-[12px]"><ChevronLeft className="w-3.5 h-3.5" /></Button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <Button key={p} variant={p===page?'default':'ghost'} size="sm" onClick={()=>setPage(p)} className={`h-7 px-2.5 text-[12px] ${p===page?'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30':''}`}>{p}</Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className="h-7 px-2 text-[12px]"><ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
