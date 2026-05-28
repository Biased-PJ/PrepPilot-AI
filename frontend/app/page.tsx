'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play, Sparkles, BarChart3, Target, Zap, Code2, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export default function Home() {
  const router = useRouter();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[hsl(222,47%,4%)] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/[0.06] bg-[hsl(222,47%,4%)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Code2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">PrepPilot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50">
            <span className="hover:text-white transition-colors cursor-pointer">Features</span>
            <span className="hover:text-white transition-colors cursor-pointer">Analytics</span>
            <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
            <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')} className="text-white/60 hover:text-white text-[13px]">
              Log in
            </Button>
            <Button size="sm" onClick={() => router.push('/signup')} className="bg-white text-black hover:bg-white/90 text-[13px] font-medium h-8 px-4 rounded-lg">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.08)_0%,transparent_70%)]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12px] text-white/60 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>AI-powered competitive programming analytics</span>
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Code smarter.
            <br />
            <span className="text-gradient">Place faster.</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            Track your progress across LeetCode, Codeforces & CodeChef. Get AI recommendations, spot weak areas, and accelerate your placement prep.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-3">
            <Button onClick={() => router.push('/signup')} size="lg" className="bg-white text-black hover:bg-white/90 font-medium h-11 px-6 rounded-lg">
              Start for free <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 h-11 px-6 rounded-lg">
              <Play className="w-4 h-4 mr-1.5" /> Watch demo
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-12 flex items-center justify-center gap-6 text-[13px] text-white/30">
            <div className="flex -space-x-2">
              {['bg-orange-500','bg-blue-500','bg-emerald-500','bg-purple-500'].map((c,i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[hsl(222,47%,4%)]`} />
              ))}
            </div>
            <span>Trusted by <span className="text-white/50 font-medium">10,000+</span> developers</span>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
          className="relative max-w-5xl mx-auto mt-16"
        >
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-1.5 shadow-2xl shadow-orange-500/5">
            <div className="rounded-lg bg-[hsl(222,47%,6%)] overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 text-center text-[12px] text-white/30">preppilot.ai/dashboard</div>
              </div>
              {/* Fake dashboard content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Solved', value: '142', color: 'from-orange-500/10 to-orange-500/5' },
                    { label: 'Streak', value: '7d', color: 'from-amber-500/10 to-amber-500/5' },
                    { label: 'Readiness', value: '72%', color: 'from-emerald-500/10 to-emerald-500/5' },
                    { label: 'Rating', value: '1680', color: 'from-blue-500/10 to-blue-500/5' },
                  ].map((s,i) => (
                    <div key={i} className={`rounded-lg bg-gradient-to-br ${s.color} border border-white/[0.06] p-4`}>
                      <div className="text-[11px] text-white/30 mb-1">{s.label}</div>
                      <div className="text-xl font-semibold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-lg border border-white/[0.06] bg-white/[0.02] h-40 flex items-center justify-center text-white/20 text-sm">
                    Weekly Activity Chart
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] h-40 flex items-center justify-center text-white/20 text-sm">
                    Difficulty Split
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under preview */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-orange-500/10 blur-3xl rounded-full" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to <span className="text-gradient">crush placements</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">Powerful analytics and AI insights, designed for competitive programmers who want to move faster.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-xl overflow-hidden">
            {[
              { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized problem suggestions based on your weak areas and goals' },
              { icon: BarChart3, title: 'Deep Analytics', desc: 'Track topic mastery, difficulty splits, and platform performance' },
              { icon: Target, title: 'Readiness Score', desc: 'Real-time placement readiness calculated from your coding data' },
              { icon: Zap, title: 'Smart Practice', desc: 'Adaptive learning paths that evolve with your skill level' },
              { icon: Code2, title: '3 Platforms', desc: 'Unified dashboard for LeetCode, Codeforces, and CodeChef' },
              { icon: Play, title: 'Contest Tracker', desc: 'Never miss a contest with smart alerts and post-contest analysis' },
            ].map((f, i) => (
              <div key={i} className="bg-[hsl(222,47%,4%)] p-8 group hover:bg-white/[0.02] transition-colors duration-300">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5 group-hover:bg-orange-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-y border-white/[0.06]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '500K+', label: 'Problems Tracked' },
            { value: '3', label: 'Platforms' },
            { value: '99.9%', label: 'Uptime' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-gradient mb-1">{s.value}</div>
              <div className="text-[13px] text-white/40">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Loved by developers</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Alex K.', role: 'SDE @ Google', text: 'PrepPilot identified my weak areas in weeks, not months. The AI recommendations are scarily accurate.', avatar: 'A' },
              { name: 'Sarah C.', role: 'Engineer @ Meta', text: 'The unified dashboard across platforms saves me hours. I finally have a single source of truth.', avatar: 'S' },
              { name: 'Arjun P.', role: 'CP Enthusiast', text: 'The readiness score gave me confidence before interviews. Landed my dream role.', avatar: 'A' },
            ].map((t, i) => (
              <div key={i} className="glass rounded-xl p-6 hover:border-white/[0.1] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center text-[13px] font-semibold text-orange-400">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium">{t.name}</div>
                    <div className="text-[12px] text-white/30">{t.role}</div>
                  </div>
                </div>
                <p className="text-[14px] text-white/50 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center glass rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to level up?</h2>
            <p className="text-white/40 mb-8">Start free. No credit card required.</p>
            <Button onClick={() => router.push('/signup')} size="lg" className="bg-white text-black hover:bg-white/90 font-medium h-11 px-8 rounded-lg">
              Get started <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[14px] font-semibold">PrepPilot</span>
          </div>
          <div className="flex gap-8 text-[13px] text-white/30">
            <span className="hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Docs</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">GitHub</span>
          </div>
          <div className="text-[12px] text-white/20">&copy; 2024 PrepPilot AI</div>
        </div>
      </footer>
    </div>
  );
}
