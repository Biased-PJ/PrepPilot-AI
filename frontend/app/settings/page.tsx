'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { Bell, Lock, User, Palette, Shield, Download, Trash2, LogOut } from 'lucide-react';

const fadeUp = { hidden:{opacity:0,y:16}, visible:(i:number)=>({opacity:1,y:0,transition:{duration:0.4,delay:i*0.05,ease:[0.25,0.4,0.25,1] as const}}) };

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`relative w-10 h-5.5 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-white/10'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[18px]' : ''}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-[14px] text-white/40 mt-1">Manage your account</p>
      </motion.div>

      {/* Profile */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <User className="w-4 h-4 text-orange-400" />
          <h2 className="text-[14px] font-semibold">Profile</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] text-white/40 mb-1.5">Full Name</label>
            <Input defaultValue="Demo User" className="bg-white/[0.03] border-white/[0.08] text-white h-9 text-[13px] rounded-lg" />
          </div>
          <div>
            <label className="block text-[12px] text-white/40 mb-1.5">Email</label>
            <Input value={user?.email || ''} disabled className="bg-white/[0.03] border-white/[0.08] text-white/40 h-9 text-[13px] rounded-lg" />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" />
          <h2 className="text-[14px] font-semibold">Notifications</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { label:'Email notifications', desc:'Progress reports and recommendations', value:emailNotif, onChange:setEmailNotif },
            { label:'Push notifications', desc:'Contest alerts and streak reminders', value:pushNotif, onChange:setPushNotif },
          ].map((item,i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium">{item.label}</div>
                <div className="text-[12px] text-white/30">{item.desc}</div>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Palette className="w-4 h-4 text-orange-400" />
          <h2 className="text-[14px] font-semibold">Appearance</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-medium">Dark mode</div>
            <div className="text-[12px] text-white/30">Use dark theme throughout the app</div>
          </div>
          <Toggle value={darkMode} onChange={setDarkMode} />
        </div>
      </motion.div>

      {/* Security */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-400" />
          <h2 className="text-[14px] font-semibold">Security</h2>
        </div>
        <div className="p-5 space-y-2">
          <Button variant="outline" className="w-full justify-start border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60 h-9 text-[13px] rounded-lg">
            <Lock className="w-3.5 h-3.5 mr-2" /> Change password
          </Button>
          <Button variant="outline" className="w-full justify-start border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60 h-9 text-[13px] rounded-lg">
            <Shield className="w-3.5 h-3.5 mr-2" /> Enable 2FA
          </Button>
        </div>
      </motion.div>

      {/* Data */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Download className="w-4 h-4 text-orange-400" />
          <h2 className="text-[14px] font-semibold">Data</h2>
        </div>
        <div className="p-5 space-y-2">
          <Button variant="outline" className="w-full justify-start border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60 h-9 text-[13px] rounded-lg">
            <Download className="w-3.5 h-3.5 mr-2" /> Export my data
          </Button>
          <Button variant="outline" className="w-full justify-start border-red-500/15 bg-red-500/[0.03] hover:bg-red-500/[0.06] text-red-400/60 h-9 text-[13px] rounded-lg">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete account
          </Button>
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
        <Button onClick={logout} className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/60 h-9 text-[13px] rounded-lg">
          <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
        </Button>
      </motion.div>
    </div>
  );
}
