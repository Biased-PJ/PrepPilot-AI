'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Zap, TrendingUp, Target, Flame, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stats = [
  { icon: Award, label: 'Total Solved', value: '142', delta: '+12', color: 'orange' },
  { icon: Flame, label: 'Current Streak', value: '7d', delta: 'Active', color: 'amber' },
  { icon: TrendingUp, label: 'Readiness', value: '72%', delta: '+5%', color: 'emerald' },
  { icon: Target, label: 'Weekly Goal', value: '6/10', delta: 'On track', color: 'blue' },
];

const weeklyData = [
  { day: 'Mon', solved: 3, attempted: 5 },
  { day: 'Tue', solved: 2, attempted: 4 },
  { day: 'Wed', solved: 5, attempted: 7 },
  { day: 'Thu', solved: 4, attempted: 6 },
  { day: 'Fri', solved: 6, attempted: 8 },
  { day: 'Sat', solved: 7, attempted: 9 },
  { day: 'Sun', solved: 2, attempted: 3 },
];

const difficultyData = [
  { name: 'Easy', value: 45, fill: '#10b981' },
  { name: 'Medium', value: 32, fill: '#f59e0b' },
  { name: 'Hard', value: 23, fill: '#ef4444' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05, ease: [0.25,0.4,0.25,1] as const } }),
};

const colorMap: Record<string, string> = {
  orange: 'from-orange-500/8 to-orange-500/3 border-orange-500/15',
  amber: 'from-amber-500/8 to-amber-500/3 border-amber-500/15',
  emerald: 'from-emerald-500/8 to-emerald-500/3 border-emerald-500/15',
  blue: 'from-blue-500/8 to-blue-500/3 border-blue-500/15',
};

const iconColorMap: Record<string, string> = {
  orange: 'text-orange-400', amber: 'text-amber-400', emerald: 'text-emerald-400', blue: 'text-blue-400',
};

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[14px] text-white/40 mt-1">Your progress at a glance</p>
        </div>
        <Link href="/problems">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-4 rounded-lg text-[13px] font-medium">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Daily Challenge
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} custom={i+1} variants={fadeUp} initial="hidden" animate="visible" className={`rounded-xl bg-gradient-to-br ${colorMap[s.color]} border p-4`}>
            <div className="flex items-start justify-between mb-3">
              <s.icon className={`w-5 h-5 ${iconColorMap[s.color]}`} />
              <span className="text-[11px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">{s.delta}</span>
            </div>
            <div className="text-2xl font-bold tracking-tight mb-0.5">{s.value}</div>
            <div className="text-[12px] text-white/35">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Weekly */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-3 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold">Weekly Activity</h2>
            <span className="text-[12px] text-white/30">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="solved" fill="#f97316" radius={[6,6,0,0]} maxBarSize={20} />
              <Bar dataKey="attempted" fill="rgba(255,255,255,0.08)" radius={[6,6,0,0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 glass rounded-xl p-5">
          <h2 className="text-[15px] font-semibold mb-5">Difficulty Split</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={difficultyData} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {difficultyData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            {difficultyData.map((d,i) => (
              <div key={i} className="flex items-center gap-1.5 text-[12px] text-white/40">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} /> {d.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Recent activity */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-3 glass rounded-xl p-5">
          <h2 className="text-[15px] font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {[
              { title: 'Two Sum II', diff: 'Easy', platform: 'LeetCode', time: '2h ago' },
              { title: 'Median of Two Sorted Arrays', diff: 'Hard', platform: 'Codeforces', time: '5h ago' },
              { title: 'Valid Palindrome', diff: 'Medium', platform: 'CodeChef', time: '1d ago' },
            ].map((a,i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div>
                  <div className="text-[14px] font-medium">{a.title}</div>
                  <div className="text-[12px] text-white/30">{a.platform} &middot; {a.time}</div>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${a.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400/80' : a.diff === 'Medium' ? 'bg-orange-500/10 text-orange-400/80' : 'bg-red-500/10 text-red-400/80'}`}>{a.diff}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI */}
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 rounded-xl bg-gradient-to-br from-orange-500/8 to-amber-500/3 border border-orange-500/15 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4.5 h-4.5 text-orange-400" />
            <h2 className="text-[15px] font-semibold">AI Insights</h2>
          </div>
          <div className="space-y-3">
            {[
              'Focus on Graph problems — your mastery is at 58%',
              'Dynamic Programming appears in 40% of interviews',
              'Your Easy solve rate improved 15% this week',
            ].map((ins,i) => (
              <div key={i} className="text-[13px] text-white/50 leading-relaxed p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                {ins}
              </div>
            ))}
          </div>
          <Link href="/recommendations" className="block mt-4">
            <Button variant="ghost" className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-[13px] h-8">
              View all recommendations <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3">
        {[
          { title: 'Connect Platforms', desc: 'Sync your accounts', href: '/integrations' },
          { title: 'AI Recommendations', desc: 'Personalized practice', href: '/recommendations' },
          { title: 'Deep Analytics', desc: 'Full performance stats', href: '/analytics' },
        ].map((q,i) => (
          <Link key={i} href={q.href} className="glass rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 group">
            <div className="text-[14px] font-medium mb-0.5 group-hover:text-orange-400 transition-colors">{q.title}</div>
            <div className="text-[12px] text-white/30">{q.desc}</div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
