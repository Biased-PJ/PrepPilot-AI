'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>(['leetcode']);
  const [usernames, setUsernames] = useState({
    leetcode: 'demo_user',
    codeforces: '',
    codechef: '',
  });

  const platforms = [
    {
      id: 'leetcode',
      name: 'LeetCode',
      description: 'Track your LeetCode problems and ratings',
      icon: '🔴',
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      description: 'Sync your Codeforces contests and ratings',
      icon: '🔵',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      description: 'Connect your CodeChef account for challenge tracking',
      icon: '🟣',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
    },
  ];

  const handleConnect = async (platformId: string) => {
    const username = usernames[platformId as keyof typeof usernames];
    if (!username) return;

    setConnecting(platformId);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConnected([...connected, platformId]);
    setConnecting(null);
  };

  const handleDisconnect = (platformId: string) => {
    setConnected(connected.filter((id) => id !== platformId));
    setUsernames((prev) => ({
      ...prev,
      [platformId]: '',
    }));
  };

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
        <h1 className="text-4xl font-bold mb-2">Platform Integrations</h1>
        <p className="text-slate-400">
          Connect your coding platform accounts to sync your progress
        </p>
      </motion.div>

      {/* Integration Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {platforms.map((platform) => {
          const isConnected = connected.includes(platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <motion.div
              key={platform.id}
              variants={itemVariants}
              className={`bg-gradient-to-br ${platform.color} border ${platform.borderColor} rounded-lg p-6 transition-all ${
                isConnected ? 'ring-2 ring-green-500/50' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{platform.icon}</div>
                {isConnected && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{platform.description}</p>

              {/* Status */}
              {isConnected && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected as @{usernames[platform.id as keyof typeof usernames]}</span>
                  </div>
                </div>
              )}

              {/* Input */}
              {!isConnected && (
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">Username</label>
                  <Input
                    placeholder={`Enter your ${platform.name} username`}
                    value={usernames[platform.id as keyof typeof usernames]}
                    onChange={(e) =>
                      setUsernames((prev) => ({
                        ...prev,
                        [platform.id]: e.target.value,
                      }))
                    }
                    className="bg-slate-700/50 border-slate-600"
                    disabled={isConnecting}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!isConnected ? (
                  <>
                    <Button
                      onClick={() => handleConnect(platform.id)}
                      disabled={
                        !usernames[platform.id as keyof typeof usernames] ||
                        isConnecting
                      }
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      {isConnecting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={`https://${platform.id}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </a>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleDisconnect(platform.id)}
                    variant="outline"
                    className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Data Sync Section */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-8"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Data Sync Information</h3>
            <p className="text-slate-400 text-sm mb-4">
              When you connect a platform, we automatically sync:
            </p>
            <ul className="space-y-2 text-slate-400 text-sm">
              {[
                'Your solved problems and solutions',
                'Difficulty level and topics covered',
                'Contest ratings and performance metrics',
                'Submission timestamps and verdicts',
                'Coding journey statistics',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-sm mt-4">
              We sync data every 6 hours. You can manually trigger a sync from your profile settings.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Connected Accounts Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg p-6"
      >
        <h3 className="font-semibold mb-4">Connected Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const isConnected = connected.includes(platform.id);
            return (
              <div key={platform.id} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: isConnected ? '#10b981' : '#6b7280',
                  }} />
                  <span className="font-medium">{platform.name}</span>
                </div>
                <div className="text-sm text-slate-400">
                  {isConnected ? (
                    <span className="text-green-400">
                      Last synced: Today at 2:30 PM
                    </span>
                  ) : (
                    <span>Not connected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
