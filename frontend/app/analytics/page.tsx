'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, Zap, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const monthlyData = [
    { month: 'Jan', leetcode: 12, codeforces: 8, codechef: 5 },
    { month: 'Feb', leetcode: 19, codeforces: 12, codechef: 8 },
    { month: 'Mar', leetcode: 25, codeforces: 18, codechef: 12 },
    { month: 'Apr', leetcode: 31, codeforces: 22, codechef: 15 },
    { month: 'May', leetcode: 42, codeforces: 28, codechef: 20 },
    { month: 'Jun', leetcode: 55, codeforces: 35, codechef: 28 },
  ];

  const ratingTrendData = [
    { week: 'W1', rating: 1200 },
    { week: 'W2', rating: 1320 },
    { week: 'W3', rating: 1450 },
    { week: 'W4', rating: 1380 },
    { week: 'W5', rating: 1520 },
    { week: 'W6', rating: 1680 },
  ];

  const topicProgressData = [
    { topic: 'Array', percentage: 85 },
    { topic: 'String', percentage: 72 },
    { topic: 'Tree', percentage: 65 },
    { topic: 'Graph', percentage: 58 },
    { topic: 'DP', percentage: 42 },
    { topic: 'Heap', percentage: 35 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-slate-400">Your coding journey insights and progress</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: Zap,
            label: 'Problems Solved',
            value: '142',
            change: '+12',
            period: 'this month',
          },
          {
            icon: TrendingUp,
            label: 'Avg Rating',
            value: '1680',
            change: '+480',
            period: 'all time',
          },
          {
            icon: Target,
            label: 'Mastery Level',
            value: '68%',
            change: '+8%',
            period: 'this month',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 text-orange-500" />
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">
                {stat.label} • {stat.period}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Problems Solved Trend */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Problems Solved Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorLeetcode" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCodeforces" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCodechef" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="leetcode"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorLeetcode)"
              />
              <Area
                type="monotone"
                dataKey="codeforces"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCodeforces)"
              />
              <Area
                type="monotone"
                dataKey="codechef"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorCodechef)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rating Trend */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Codeforces Rating Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratingTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Topic Mastery */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Topic Mastery</h2>
        <div className="space-y-4">
          {topicProgressData.map((topic, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">{topic.topic}</span>
                <span className="text-orange-500 font-medium">{topic.percentage}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platform Comparison */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Platform Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { platform: 'LeetCode', easy: 45, medium: 32, hard: 23 },
              { platform: 'Codeforces', easy: 32, medium: 28, hard: 15 },
              { platform: 'CodeChef', easy: 28, medium: 18, hard: 12 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="platform" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="easy" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="medium" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            <Bar dataKey="hard" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Insights */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Key Insights</h2>
        <div className="space-y-4">
          {[
            "You're strongest in Array problems (85% mastery)",
            "Graph problems need more practice (58% mastery)",
            "Your LeetCode streak is at 7 days - keep it up!",
            "Average problem solving time has decreased by 12%",
          ].map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
              <span className="text-slate-300">{insight}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
