'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Target, Flame, Clock, Code, Sparkles } from 'lucide-react';

const recommendations = [
  { title:'Focus on Graph Algorithms', desc:'Your mastery is only 58%. Practice DFS, BFS, and topological sort', priority:'High', time:'4 weeks', problems:25, icon:Target, color:'from-red-500/8 to-red-500/3 border-red-500/15' },
  { title:'Master Dynamic Programming', desc:'Common in interviews. Start with LIS, knapsack, and coin change', priority:'High', time:'5 weeks', problems:30, icon:Flame, color:'from-orange-500/8 to-orange-500/3 border-orange-500/15' },
  { title:'Practice Heap Problems', desc:'Only 35% solved. Focus on priority queues and top-k elements', priority:'Medium', time:'2 weeks', problems:15, icon:Clock, color:'from-amber-500/8 to-amber-500/3 border-amber-500/15' },
  { title:'Binary Search Optimization', desc:'Improve search efficiency with advanced binary search patterns', priority:'Medium', time:'1 week', problems:10, icon:Code, color:'from-blue-500/8 to-blue-500/3 border-blue-500/15' },
];

const fadeUp = { hidden:{opacity:0,y:16}, visible:(i:number)=>({opacity:1,y:0,transition:{duration:0.4,delay:i*0.05,ease:[0.25,0.4,0.25,1] as const}}) };

export default function RecommendationsPage() {
  return (
    <div className="w-full space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-[14px] text-white/40 mt-1">Personalized recommendations for you</p>
      </motion.div>

      {/* Focus areas */}
      <div className="space-y-3">
        {recommendations.map((r,i) => {
          const Icon = r.icon;
          return (
            <motion.div key={i} custom={i+1} variants={fadeUp} initial="hidden" animate="visible" className={`rounded-xl bg-gradient-to-br ${r.color} border p-5 flex items-start gap-4 group hover:bg-white/[0.03] transition-all`}>
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4.5 h-4.5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="text-[15px] font-semibold">{r.title}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0 ${r.priority==='High'?'bg-red-500/10 text-red-400/80':'bg-amber-500/10 text-amber-400/80'}`}>{r.priority}</span>
                </div>
                <p className="text-[13px] text-white/40 mb-3">{r.desc}</p>
                <div className="flex gap-4 text-[12px] text-white/30">
                  <span><span className="text-orange-400/70 font-medium">{r.problems}</span> problems</span>
                  <span>~<span className="text-orange-400/70 font-medium">{r.time}</span></span>
                </div>
              </div>
              <Button size="sm" className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 hover:text-white h-8 px-3 text-[12px] rounded-lg flex-shrink-0">
                Start <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly challenge */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl bg-gradient-to-br from-orange-500/8 via-amber-500/5 to-transparent border border-orange-500/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-2xl rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4.5 h-4.5 text-orange-400" />
            <h3 className="text-[15px] font-semibold">This Week&apos;s Challenge</h3>
          </div>
          <h4 className="text-lg font-semibold mb-1">Master Merge Intervals</h4>
          <p className="text-[13px] text-white/40 mb-4">Interval problems appear in 30% of FAANG interviews. Master overlapping intervals to boost your readiness.</p>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-4 text-[13px] rounded-lg">
            Solve Challenge <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
