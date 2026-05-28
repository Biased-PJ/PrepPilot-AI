'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Code,
  BarChart3,
  Lightbulb,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Code2,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Code, label: 'Problems', href: '/problems' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Lightbulb, label: 'Recommendations', href: '/recommendations' },
    { icon: Code2, label: 'Integrations', href: '/integrations' },
    { icon: Users, label: 'Leaderboard', href: '/leaderboard' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-orange-500">PrepPilot</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:flex md:flex-col md:w-64 md:h-screen md:bg-slate-900 md:border-r md:border-slate-800 md:pt-8">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-8">
            <Code2 className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              PrepPilot
            </span>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-8">
            <div className="text-sm text-slate-400 mb-2">Logged in as</div>
            <div className="font-medium truncate">{user?.email}</div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-8 border-t border-slate-800 pt-8">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          exit={{ x: -256 }}
          className="fixed inset-0 z-30 md:hidden"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 w-64 h-screen bg-slate-900 border-r border-slate-800 pt-20 overflow-y-auto">
            <nav className="px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    pathname === item.href
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 mt-8"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
