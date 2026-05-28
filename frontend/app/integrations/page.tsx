'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, CheckCircle2, ExternalLink, Unplug } from 'lucide-react';

const platforms = [
  { id:'leetcode', name:'LeetCode', desc:'Track problems, contests & ratings', icon:'LC', gradient:'from-orange-500/8 to-orange-500/3', border:'border-orange-500/20', text:'text-orange-400', badge:'bg-orange-500' },
  { id:'codeforces', name:'Codeforces', desc:'Sync contest performance & rating', icon:'CF', gradient:'from-blue-500/8 to-blue-500/3', border:'border-blue-500/20', text:'text-blue-400', badge:'bg-blue-500' },
  { id:'codechef', name:'CodeChef', desc:'Connect challenge & practice data', icon:'CC', gradient:'from-amber-500/8 to-amber-500/3', border:'border-amber-500/20', text:'text-amber-400', badge:'bg-amber-500' },
];

const fadeUp = { hidden:{opacity:0,y:16}, visible:(i:number)=>({opacity:1,y:0,transition:{duration:0.4,delay:i*0.05,ease:[0.25,0.4,0.25,1] as const}}) };

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string|null>(null);
  const [connected, setConnected] = useState<string[]>(['leetcode']);
  const [usernames, setUsernames] = useState({ leetcode:'demo_user', codeforces:'', codechef:'' });

  const handleConnect = async (id:string) => {
    if (!usernames[id as keyof typeof usernames]) return;
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1500));
    setConnected([...connected, id]);
    setConnecting(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-[14px] text-white/40 mt-1">Connect your coding platforms</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {platforms.map((p,i) => {
          const isOn = connected.includes(p.id);
          const isBusy = connecting === p.id;
          return (
            <motion.div key={p.id} custom={i+1} variants={fadeUp} initial="hidden" animate="visible" className={`rounded-xl bg-gradient-to-br ${p.gradient} border ${p.border} p-5 transition-all ${isOn ? 'ring-1 ring-emerald-500/30' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${p.badge}/20 flex items-center justify-center text-[13px] font-bold ${p.text}`}>{p.icon}</div>
                {isOn && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <h3 className="text-[15px] font-semibold mb-1">{p.name}</h3>
              <p className="text-[13px] text-white/35 mb-5">{p.desc}</p>

              {isOn ? (
                <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-[12px] text-emerald-400/80 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> @{usernames[p.id as keyof typeof usernames]}
                </div>
              ) : (
                <div className="mb-4">
                  <Input placeholder={`${p.name} username`} value={usernames[p.id as keyof typeof usernames]} onChange={e=>setUsernames(prev=>({...prev,[p.id]:e.target.value}))} disabled={isBusy} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-8 text-[13px] rounded-lg" />
                </div>
              )}

              <div className="flex gap-2">
                {isOn ? (
                  <Button variant="outline" size="sm" onClick={()=>{setConnected(connected.filter(x=>x!==p.id));setUsernames(prev=>({...prev,[p.id]:''}));}} className="w-full border-red-500/20 text-red-400/80 hover:bg-red-500/10 h-8 text-[12px]">
                    <Unplug className="w-3.5 h-3.5 mr-1" /> Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={()=>handleConnect(p.id)} disabled={!usernames[p.id as keyof typeof usernames]||isBusy} className={`w-full ${p.badge} hover:opacity-90 text-white h-8 text-[12px]`}>
                    {isBusy && <Loader className="w-3.5 h-3.5 mr-1 animate-spin" />} {isBusy ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sync info */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
        <h3 className="text-[15px] font-semibold mb-4">What we sync</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Solved problems','Contest ratings','Difficulty stats','Submission history','Topic coverage'].map((item,i) => (
            <div key={i} className="text-[12px] text-white/40 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="w-1 h-1 rounded-full bg-orange-400/60" /> {item}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
