'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Target, Flame, Clock, Code } from 'lucide-react';

export default function RecommendationsPage() {
  const recommendations = [
    {
      id: 1,
      title: 'Focus on Graph Algorithms',
      description: 'Your mastery is only 58%. Practice DFS, BFS, and topological sort',
      priority: 'High',
      estimatedTime: '4 weeks',
      problems: 25,
      icon: Target,
      color: 'from-red-500/20 to-red-600/20',
    },
    {
      id: 2,
      title: 'Master Dynamic Programming',
      description: 'Common in interviews. Start with classic problems like LIS and knapsack',
      priority: 'High',
      estimatedTime: '5 weeks',
      problems: 30,
      icon: Flame,
      color: 'from-orange-500/20 to-orange-600/20',
    },
    {
      id: 3,
      title: "Practice Heap Problems",
      description: "You've solved only 35% of heap problems. Focus on priority queues",
      priority: 'Medium',
      estimatedTime: '2 weeks',
      problems: 15,
      icon: Clock,
      color: 'from-yellow-500/20 to-yellow-600/20',
    },
    {
      id: 4,
      title: 'Binary Search Optimization',
      description: 'Improve your search efficiency. Learn advanced binary search techniques',
      priority: 'Medium',
      estimatedTime: '1 week',
      problems: 10,
      icon: Code,
      color: 'from-blue-500/20 to-blue-600/20',
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
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">AI Recommendations</h1>
        <p className="text-slate-400">Personalized learning paths based on your profile</p>
      </motion.div>

      <motion.div variants={containerVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">Focus Areas</h2>
        <div className="grid gap-4">
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`bg-gradient-to-br ${rec.color} border border-slate-700/50 rounded-lg p-6 hover:border-orange-500/50 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <Icon className="w-8 h-8 text-orange-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{rec.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'High'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{rec.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="text-slate-400">
                        <span className="text-orange-500 font-medium">{rec.problems}</span> problems
                      </div>
                      <div className="text-slate-400">
                        ~<span className="text-orange-500 font-medium">{rec.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap">
                    Start <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-8"
      >
        <h3 className="text-2xl font-semibold mb-2">This Week's Challenge</h3>
        <p className="text-slate-400 mb-4">Master Merge Intervals - Medium Difficulty</p>
        <p className="text-slate-300 mb-6">
          Interval problems are frequently asked in interviews. This challenge will help you
          master merging overlapping intervals efficiently.
        </p>
        <Button className="bg-purple-500 hover:bg-purple-600">
          Solve Challenge <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
