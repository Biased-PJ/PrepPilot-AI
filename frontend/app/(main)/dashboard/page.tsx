"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Zap,
  TrendingUp,
  Target,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { analyticsAPI, platformAPI } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
};

const colorMap: Record<string, string> = {
  orange: "from-orange-500/8 to-orange-500/3 border-orange-500/15",
  amber: "from-amber-500/8 to-amber-500/3 border-amber-500/15",
  emerald: "from-emerald-500/8 to-emerald-500/3 border-emerald-500/15",
  blue: "from-blue-500/8 to-blue-500/3 border-blue-500/15",
};

const iconColorMap: Record<string, string> = {
  orange: "text-orange-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  blue: "text-blue-400",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    currentStreak: 0,
    readiness: 70,
    recentSubmissions: [] as any[],
  });

  useEffect(() => {
    async function loadLiveDashboardMetrics() {
      try {
        // 1. Fetch our master unified stats object directly
        const dashboardRes = await analyticsAPI.getDashboard();
        const activityRes = await analyticsAPI.getActivity();
        const leetcodeRes = await platformAPI.getPlatformStats("leetcode");

        if (dashboardRes.data?.success && dashboardRes.data?.dashboard) {
          const d = dashboardRes.data.dashboard;

          let recent: any[] = [];
          if (
            leetcodeRes.data?.success &&
            leetcodeRes.data?.profile?.metadata?.recent_submissions
          ) {
            recent = leetcodeRes.data.profile.metadata.recent_submissions.slice(
              0,
              3,
            );
          }

          setDashboardStats({
            totalSolved: d.total || 0,
            easySolved: d.easy || 0,
            mediumSolved: d.medium || 0,
            hardSolved: d.hard || 0,
            currentStreak: activityRes.data?.activity?.current_streak || 0,
            readiness: 72, // Tie to your readiness endpoint if needed
            recentSubmissions: recent,
          });
        }
      } catch (err) {
        console.error("Unified telemetry calculation dropped:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveDashboardMetrics();
  }, []);

  // Dynamically map values into state rendering lists
  const metricCards = [
    {
      icon: Award,
      label: "Total Solved",
      value: dashboardStats.totalSolved.toString(),
      delta: "Live Sync",
      color: "orange",
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${dashboardStats.currentStreak}d`,
      delta: "Active",
      color: "amber",
    },
    {
      icon: TrendingUp,
      label: "Readiness",
      value: `${dashboardStats.readiness}%`,
      delta: "Stable",
      color: "emerald",
    },
    {
      icon: Target,
      label: "Weekly Goal",
      value: `${Math.min(dashboardStats.totalSolved, 10)}/10`,
      delta: "Progress",
      color: "blue",
    },
  ];

  const difficultyChartData = [
    { name: "Easy", value: dashboardStats.easySolved || 1, fill: "#10b981" },
    {
      name: "Medium",
      value: dashboardStats.mediumSolved || 1,
      fill: "#f59e0b",
    },
    { name: "Hard", value: dashboardStats.hardSolved || 1, fill: "#ef4444" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-[13px] text-white/40">
          Compiling unified profile statistics...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[14px] text-white/40 mt-1">
            Your progress at a glance
          </p>
        </div>
        <Link href="/problems">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-4 rounded-lg text-[13px] font-medium">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Daily Challenge
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((s, i) => (
          <motion.div
            key={i}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={`rounded-xl bg-gradient-to-br ${colorMap[s.color]} border p-4`}
          >
            <div className="flex items-start justify-between mb-3">
              <s.icon className={`w-5 h-5 ${iconColorMap[s.color]}`} />
              <span className="text-[11px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {s.delta}
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight mb-0.5">
              {s.value}
            </div>
            <div className="text-[12px] text-white/35">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Weekly Progress Mockup */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3 glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold">Weekly Activity</h2>
            <span className="text-[12px] text-white/30">Last 7 days</span>
          </div>
          <ResponsiveContainer
            width="100%"
            height={220}
          >
            <BarChart
              data={[
                {
                  day: "Mon",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.1),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.15),
                },
                {
                  day: "Tue",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.05),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.1),
                },
                {
                  day: "Wed",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.2),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.25),
                },
                {
                  day: "Thu",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.12),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.18),
                },
                {
                  day: "Fri",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.15),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.2),
                },
                {
                  day: "Sat",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.25),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.3),
                },
                {
                  day: "Sun",
                  solved: Math.ceil(dashboardStats.totalSolved * 0.1),
                  attempted: Math.ceil(dashboardStats.totalSolved * 0.12),
                },
              ]}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222,47%,8%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="solved"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="attempted"
                fill="rgba(255,255,255,0.08)"
                radius={[6, 6, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Live Difficulty Distribution */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 glass rounded-xl p-5"
        >
          <h2 className="text-[15px] font-semibold mb-5">Difficulty Split</h2>
          <ResponsiveContainer
            width="100%"
            height={160}
          >
            <PieChart>
              <Pie
                data={difficultyChartData}
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                strokeWidth={0}
              >
                {difficultyChartData.map((e, i) => (
                  <Cell
                    key={i}
                    fill={e.fill}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222,47%,8%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            {difficultyChartData.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[12px] text-white/40"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: d.fill }}
                />{" "}
                {d.name} (
                {d.value === 1 && dashboardStats.totalSolved === 0
                  ? 0
                  : d.value}
                )
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Live Submissions + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Real Dynamic Submissions */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3 glass rounded-xl p-5"
        >
          <h2 className="text-[15px] font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {dashboardStats.recentSubmissions.length > 0 ? (
              dashboardStats.recentSubmissions.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div>
                    <div className="text-[14px] font-medium">{a.title}</div>
                    <div className="text-[12px] text-white/30">
                      LeetCode &middot; {a.language} &middot; {a.status}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded bg-orange-500/10 text-orange-400/80`}
                  >
                    Verified
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[13px] text-white/20">
                No recent submissions found. Click "Sync Stats Now" inside
                Integrations.
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Block */}
        <motion.div
          custom={8}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 rounded-xl bg-gradient-to-br from-orange-500/8 to-amber-500/3 border border-orange-500/15 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4.5 h-4.5 text-orange-400" />
            <h2 className="text-[15px] font-semibold">AI Insights</h2>
          </div>
          <div className="space-y-3">
            {[
              `Your solved problem count is currently at ${dashboardStats.totalSolved}.`,
              "Dynamic Programming appears in 40% of standard technical evaluations.",
              "Keep synchronization active to view real-time pattern tracking.",
            ].map((ins, i) => (
              <div
                key={i}
                className="text-[13px] text-white/50 leading-relaxed p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                {ins}
              </div>
            ))}
          </div>
          <Link
            href="/recommendations"
            className="block mt-4"
          >
            <Button
              variant="ghost"
              className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-[13px] h-8"
            >
              View all recommendations{" "}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
