'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Code, BarChart3, Lightbulb, Users, Settings, LogOut, Menu, X, Code2, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Code, label: 'Problems', href: '/problems' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Lightbulb, label: 'AI Insights', href: '/recommendations' },
  { icon: Code2, label: 'Integrations', href: '/integrations' },
  { icon: Users, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); router.push('/'); };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,4%)] text-white">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-white/[0.06] bg-[hsl(222,47%,4%)]/90 backdrop-blur-xl px-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[14px] font-semibold">PrepPilot</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/[0.04] rounded-lg text-white/50">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:fixed md:flex-col md:w-[220px] md:h-screen md:border-r md:border-white/[0.06] md:bg-[hsl(222,47%,6%)] md:pt-5">
        <div className="px-4 mb-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">PrepPilot</span>
          </Link>
        </div>

        <div className="px-3 mb-4">
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px]">
            <div className="text-white/30 mb-0.5">Logged in as</div>
            <div className="text-white/70 truncate font-medium">{user?.email}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${isActive ? 'bg-orange-500/10 text-orange-400' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}>
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-orange-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-4 border-t border-white/[0.06] mt-4">
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/30 hover:text-white/60 hover:bg-white/[0.03] w-full transition-all">
            <LogOut className="w-[18px] h-[18px]" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 w-[220px] h-screen bg-[hsl(222,47%,6%)] border-r border-white/[0.06] z-40 pt-16 overflow-y-auto">
              <nav className="px-3 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${isActive ? 'bg-orange-500/10 text-orange-400' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}>
                      <item.icon className="w-[18px] h-[18px]" /> <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/30 hover:text-white/60 hover:bg-white/[0.03] w-full mt-4">
                  <LogOut className="w-[18px] h-[18px]" /> Sign out
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="md:ml-[220px] pt-14 md:pt-0">
        <div className="min-h-screen p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
