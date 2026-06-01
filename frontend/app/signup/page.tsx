'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Code2, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!name.trim()) { setError('Name is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await signup(name.trim(), email, password); } catch (err: any) { setError(err.response?.data?.message || 'Signup failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,4%)] flex items-center justify-center px-4 py-6">
      {/* Grid bg */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.06)_0%,transparent_70%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25,0.4,0.25,1] }} className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Code2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">PrepPilot</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Create your account</h1>
          <p className="text-[14px] text-white/40">Start tracking your coding journey</p>
        </div>

        <div className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-white/50 mb-1.5">Name</label>
              <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 h-10 text-[14px] rounded-lg focus:border-orange-500/50 focus:ring-orange-500/20" required disabled={loading} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-white/50 mb-1.5">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 h-10 text-[14px] rounded-lg focus:border-orange-500/50 focus:ring-orange-500/20" required disabled={loading} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-white/50 mb-1.5">Password</label>
              <Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 h-10 text-[14px] rounded-lg focus:border-orange-500/50 focus:ring-orange-500/20" required disabled={loading} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-white/50 mb-1.5">Confirm Password</label>
              <Input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 h-10 text-[14px] rounded-lg focus:border-orange-500/50 focus:ring-orange-500/20" required disabled={loading} />
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-[13px]">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90 font-medium h-10 rounded-lg text-[14px]">
              {loading ? 'Creating account...' : <>Create account <ArrowRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-[13px] text-white/40">Already have an account? <Link href="/login" className="text-orange-400 hover:text-orange-300">Log in</Link></p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {['Track progress across 3 platforms', 'Get AI-powered recommendations', 'Monitor your readiness score'].map((f,i) => (
            <div key={i} className="flex items-center gap-2.5 text-[13px] text-white/30">
              <Check className="w-3.5 h-3.5 text-orange-400/60" /> {f}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
