'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
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
  Legend,
} from 'recharts';
import { Zap, TrendingUp, Target, Flame, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const mockChartData = [
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

  const stats = [
    {
      icon: Award,
      label: 'Total Solved',
      value: '142',
      change: '+12 this week',
      color: 'orange',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: '7 days',
      change: 'Keep it up!',
      color: 'red',
    },
    {
      icon: TrendingUp,
      label: 'Readiness Score',
      value: '72%',
      change: '+5% this month',
      color: 'blue',
    },
    {
      icon: Target,
      label: 'Weekly Target',
      value: '6/10',
      change: 'Problems solved',
      color: 'purple',
    },
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
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your progress summary</p>
        </div>
        <Link href="/problems">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Zap className="w-4 h-4 mr-2" />
            Daily Challenge
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const colorClasses = {
            orange: 'from-orange-500/20 to-orange-600/20',
            red: 'from-red-500/20 to-red-600/20',
            blue: 'from-blue-500/20 to-blue-600/20',
            purple: 'from-purple-500/20 to-purple-600/20',
          };

          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} border border-slate-700/50 rounded-lg p-6 hover:border-orange-500/30 transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 text-orange-500" />
                <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="solved" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="attempted" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Difficulty Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4 text-sm">
            {difficultyData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-slate-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Solved Two Sum II',
              difficulty: 'Easy',
              time: '2 hours ago',
              platform: 'LeetCode',
            },
            {
              title: 'Attempted Median of Two Sorted Arrays',
              difficulty: 'Hard',
              time: '5 hours ago',
              platform: 'Codeforces',
            },
            {
              title: 'Solved Valid Palindrome',
              difficulty: 'Medium',
              time: '1 day ago',
              platform: 'CodeChef',
            },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
            >
              <div className="flex-1">
                <div className="font-medium">{activity.title}</div>
                <div className="text-sm text-slate-400">
                  {activity.platform} • {activity.time}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.difficulty === 'Easy'
                    ? 'bg-green-500/20 text-green-400'
                    : activity.difficulty === 'Medium'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                {activity.difficulty}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            title: 'Connect Platforms',
            description: 'Sync your accounts',
            href: '/integrations',
          },
          {
            title: 'Get Recommendations',
            description: 'See AI suggestions',
            href: '/recommendations',
          },
          {
            title: 'View Analytics',
            description: 'Deep dive into stats',
            href: '/analytics',
          },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 hover:border-orange-500/50 transition-all cursor-pointer">
              <div className="font-medium mb-2">{action.title}</div>
              <div className="text-sm text-slate-400">{action.description}</div>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
