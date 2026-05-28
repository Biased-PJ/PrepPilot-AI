'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Zap, Target } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', leetcode: 12, codeforces: 8, codechef: 5 },
  { month: 'Feb', leetcode: 19, codeforces: 12, codechef: 8 },
  { month: 'Mar', leetcode: 25, codeforces: 18, codechef: 12 },
  { month: 'Apr', leetcode: 31, codeforces: 22, codechef: 15 },
  { month: 'May', leetcode: 42, codeforces: 28, codechef: 20 },
  { month: 'Jun', leetcode: 55, codeforces: 35, codechef: 28 },
];

const ratingData = [
  { week: 'W1', rating: 1200 }, { week: 'W2', rating: 1320 }, { week: 'W3', rating: 1450 },
  { week: 'W4', rating: 1380 }, { week: 'W5', rating: 1520 }, { week: 'W6', rating: 1680 },
];

const topicProgress = [
  { topic: 'Array', pct: 85 }, { topic: 'String', pct: 72 }, { topic: 'Tree', pct: 65 },
  { topic: 'Graph', pct: 58 }, { topic: 'DP', pct: 42 }, { topic: 'Heap', pct: 35 },
];

const platformPerf = [
  { platform: 'LeetCode', easy: 45, medium: 32, hard: 23 },
  { platform: 'Codeforces', easy: 32, medium: 28, hard: 15 },
  { platform: 'CodeChef', easy: 28, medium: 18, hard: 12 },
];

const fadeUp = { hidden: { opacity:0, y:16 }, visible: (i:number) => ({ opacity:1, y:0, transition: { duration:0.4, delay:i*0.05, ease:[0.25, 0.4, 0.25, 1] as const } }) };
const tooltipStyle = { backgroundColor:'hsl(222,47%,8%)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', fontSize:'12px' };

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-[14px] text-white/40 mt-1">Deep dive into your performance</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[{ icon: Zap, label:'Problems Solved', value:'142', delta:'+12' },
          { icon: TrendingUp, label:'Avg Rating', value:'1680', delta:'+480' },
          { icon: Target, label:'Mastery Level', value:'68%', delta:'+8%' },
        ].map((s,i) => (
          <motion.div key={i} custom={i+1} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl p-4">
            <s.icon className="w-4.5 h-4.5 text-orange-400 mb-3" />
            <div className="flex items-end gap-2 mb-0.5">
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="text-[11px] text-emerald-400/80 pb-1">{s.delta}</span>
            </div>
            <div className="text-[12px] text-white/35">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
          <h2 className="text-[15px] font-semibold mb-5">Solve Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gLC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                <linearGradient id="gCF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gCC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.15)" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{fontSize:'12px',opacity:0.5}} />
              <Area type="monotone" dataKey="leetcode" stroke="#f97316" fill="url(#gLC)" strokeWidth={2} />
              <Area type="monotone" dataKey="codeforces" stroke="#3b82f6" fill="url(#gCF)" strokeWidth={2} />
              <Area type="monotone" dataKey="codechef" stroke="#a855f7" fill="url(#gCC)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
          <h2 className="text-[15px] font-semibold mb-5">Rating Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.15)" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="rating" stroke="#f97316" strokeWidth={2.5} dot={{fill:'#f97316',r:3}} activeDot={{r:5}} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Topic mastery */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
        <h2 className="text-[15px] font-semibold mb-5">Topic Mastery</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {topicProgress.map((t,i) => (
            <div key={i}>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="text-white/60">{t.topic}</span>
                <span className="text-orange-400 font-medium">{t.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div initial={{width:0}} animate={{width:`${t.pct}%`}} transition={{duration:0.8,delay:i*0.08}} className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platform performance */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
        <h2 className="text-[15px] font-semibold mb-5">Platform Performance</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={platformPerf} barGap={2} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="platform" stroke="rgba(255,255,255,0.15)" tick={{fontSize:12}} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.15)" tick={{fontSize:12}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{fontSize:'12px',opacity:0.5}} />
            <Bar dataKey="easy" fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="medium" fill="#f59e0b" radius={[4,4,0,0]} />
            <Bar dataKey="hard" fill="#ef4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
