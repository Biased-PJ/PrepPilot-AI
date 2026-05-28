'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Target } from 'lucide-react';

const leaders = [
  { rank:1, name:'Alex Kumar', rating:2150, solved:320, streak:45, you:false },
  { rank:2, name:'Sarah Chen', rating:2085, solved:298, streak:38, you:false },
  { rank:3, name:'Arjun Patel', rating:2010, solved:275, streak:32, you:false },
  { rank:4, name:'You', rating:1680, solved:142, streak:7, you:true },
  { rank:5, name:'Emily Watson', rating:1620, solved:138, streak:12, you:false },
  { rank:6, name:'David Lee', rating:1580, solved:125, streak:8, you:false },
  { rank:7, name:'Priya Singh', rating:1520, solved:112, streak:15, you:false },
  { rank:8, name:'James Wilson', rating:1450, solved:98, streak:5, you:false },
  { rank:9, name:'Lisa Anderson', rating:1380, solved:87, streak:3, you:false },
  { rank:10, name:'Tom Harris', rating:1320, solved:75, streak:10, you:false },
];

const fadeUp = { hidden:{opacity:0,y:16}, visible:(i:number)=>({opacity:1,y:0,transition:{duration:0.4,delay:i*0.05,ease:[0.25,0.4,0.25,1] as const}}) };

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-[14px] text-white/40 mt-1">Community rankings</p>
      </motion.div>

      {/* Your stats */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-4 gap-3">
        {[
          { icon:Trophy, label:'Your Rank', value:'#4', c:'orange' },
          { icon:TrendingUp, label:'Rating', value:'1680', c:'blue' },
          { icon:Zap, label:'Solved', value:'142', c:'emerald' },
          { icon:Target, label:'Streak', value:'7d', c:'amber' },
        ].map((s,i) => {
          const colors:Record<string,string> = { orange:'from-orange-500/8 border-orange-500/15', blue:'from-blue-500/8 border-blue-500/15', emerald:'from-emerald-500/8 border-emerald-500/15', amber:'from-amber-500/8 border-amber-500/15' };
          const iconColors:Record<string,string> = { orange:'text-orange-400', blue:'text-blue-400', emerald:'text-emerald-400', amber:'text-amber-400' };
          return (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${colors[s.c]} border p-4`}>
              <s.icon className={`w-4.5 h-4.5 ${iconColors[s.c]} mb-2`} />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-[12px] text-white/35">{s.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Rankings table */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.06] text-[12px] text-white/25 font-medium">
          <div className="col-span-1">#</div>
          <div className="col-span-4">User</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-2">Solved</div>
          <div className="col-span-2">Streak</div>
          <div className="col-span-1" />
        </div>
        {/* Rows */}
        <div className="divide-y divide-white/[0.03]">
          {leaders.map((u,i) => (
            <div key={i} className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-[13px] hover:bg-white/[0.02] transition-colors ${u.you ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : ''}`}>
              <div className="col-span-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${u.rank<=3 ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20' : u.you ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-white/[0.04] text-white/30'}`}>
                  {u.rank}
                </div>
              </div>
              <div className="col-span-4 font-medium truncate">
                {u.name} {u.you && <span className="text-orange-400/60 text-[11px] ml-1">(you)</span>}
              </div>
              <div className="col-span-2 text-orange-400/80 font-medium">{u.rating}</div>
              <div className="col-span-2 text-white/40">{u.solved}</div>
              <div className="col-span-2 text-white/40">{u.streak}d</div>
              <div className="col-span-1">
                {u.rank<=3 && <span className="text-[14px]">{u.rank===1?'🥇':u.rank===2?'🥈':'🥉'}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
