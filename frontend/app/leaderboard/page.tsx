'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Target } from 'lucide-react';

export default function LeaderboardPage() {
  const leaderboardData = [
    { rank: 1, name: 'Alex Kumar', rating: 2150, solved: 320, streak: 45, badge: '👑' },
    { rank: 2, name: 'Sarah Chen', rating: 2085, solved: 298, streak: 38, badge: '⭐' },
    { rank: 3, name: 'Arjun Patel', rating: 2010, solved: 275, streak: 32, badge: '⭐' },
    { rank: 4, name: 'You', rating: 1680, solved: 142, streak: 7, badge: '🎯' },
    { rank: 5, name: 'Emily Watson', rating: 1620, solved: 138, streak: 12, badge: '🚀' },
    { rank: 6, name: 'David Lee', rating: 1580, solved: 125, streak: 8, badge: '🔥' },
    { rank: 7, name: 'Priya Singh', rating: 1520, solved: 112, streak: 15, badge: '💎' },
    { rank: 8, name: 'James Wilson', rating: 1450, solved: 98, streak: 5, badge: '🌟' },
    { rank: 9, name: 'Lisa Anderson', rating: 1380, solved: 87, streak: 3, badge: '✨' },
    { rank: 10, name: 'Tom Harris', rating: 1320, solved: 75, streak: 10, badge: '🎪' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-slate-400">Competitive rankings across the community</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: 'Your Rank', value: '#4', color: 'orange' },
          { icon: TrendingUp, label: 'Your Rating', value: '1680', color: 'blue' },
          { icon: Zap, label: 'Problems Solved', value: '142', color: 'purple' },
          { icon: Target, label: 'Current Streak', value: '7 days', color: 'red' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const colors = {
            orange: 'from-orange-500/20 to-orange-600/20',
            blue: 'from-blue-500/20 to-blue-600/20',
            purple: 'from-purple-500/20 to-purple-600/20',
            red: 'from-red-500/20 to-red-600/20',
          };
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} border border-slate-700/50 rounded-lg p-6`}
            >
              <Icon className="w-6 h-6 text-orange-500 mb-2" />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden"
      >
        <div className="sticky top-0 bg-slate-900/50 backdrop-blur-sm p-4 border-b border-slate-700/50">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">User</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Solved</div>
            <div className="col-span-2">Streak</div>
            <div className="col-span-1">Badge</div>
          </div>
        </div>

        <div className="divide-y divide-slate-700/50">
          {leaderboardData.map((user, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`p-4 hover:bg-slate-700/20 transition-all ${
                user.name === 'You' ? 'bg-orange-500/10 border-l-2 border-orange-500' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.rank <= 3
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                      : user.name === 'You'
                        ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50'
                        : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {user.rank}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="font-medium">
                    {user.name} {user.name === 'You' && <span className="text-orange-500 ml-2">(You)</span>}
                  </div>
                </div>
                <div className="col-span-2 text-orange-500 font-semibold">{user.rating}</div>
                <div className="col-span-2 text-slate-400">{user.solved}</div>
                <div className="col-span-2 text-slate-400">{user.streak} days</div>
                <div className="col-span-1 text-lg">{user.badge}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">How Ranking Works</h2>
        <div className="space-y-4 text-slate-400">
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <p>Your rating is calculated based on problems solved across all platforms</p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <p>Difficulty level and time taken are factors in rating calculation</p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <p>Streaks are maintained when you solve at least 1 problem per day</p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <p>Rankings update in real-time as you solve problems</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
