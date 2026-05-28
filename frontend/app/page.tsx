'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Brain,
  BarChart3,
  Zap,
  Target,
  Users,
  ArrowRight,
  CheckCircle,
  Code,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations based on your coding patterns and weak areas',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your progress across LeetCode, Codeforces, and CodeChef',
    },
    {
      icon: Target,
      title: 'Smart Practice Plans',
      description: 'Adaptive learning paths tailored to your skill level and goals',
    },
    {
      icon: Zap,
      title: 'Real-Time Readiness',
      description: 'Monitor your placement and interview readiness with precision',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Code className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                PrepPilot
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-slate-300 hover:text-white"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -top-40 -right-40 animate-pulse" />
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-40 -left-40 animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-7xl font-bold mb-6 leading-tight"
          >
            Master Competitive{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Programming
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
          >
            AI-powered platform to track your coding journey, get smart recommendations, and
            accelerate your path to landing your dream job
          </motion.p>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center flex-col sm:flex-row"
          >
            <Button
              onClick={() => router.push('/signup')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 text-lg px-8"
            >
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/login')}
              className="border-slate-700 text-white hover:bg-slate-800 text-lg px-8"
            >
              Login
            </Button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="text-sm text-slate-400 mt-4"
          >
            Join 10,000+ competitive programmers improving daily
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

              <feature.icon className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-y border-slate-800">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: 'Active Users', value: '10,000+' },
            { label: 'Problems Solved', value: '500K+' },
            { label: 'Platforms', value: '3' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">{stat.value}</div>
              <div className="text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-slate-400">See what competitive programmers are saying</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              name: 'Alex Kumar',
              role: 'SDE at Google',
              text: 'PrepPilot helped me identify my weak areas and track progress across platforms efficiently.',
              avatar: '🧑‍💻',
            },
            {
              name: 'Sarah Chen',
              role: 'Software Engineer at Meta',
              text: 'The AI recommendations are incredibly accurate. Saved me months of aimless practice.',
              avatar: '👩‍💻',
            },
            {
              name: 'Arjun Patel',
              role: 'Competitive Programmer',
              text: 'Amazing platform for tracking readiness. The analytics are insightful and actionable.',
              avatar: '🧑‍💻',
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{testimonial.avatar}</span>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-slate-300">{testimonial.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Master Competitive Programming?</h2>
          <p className="text-slate-300 mb-8">Start your free trial today. No credit card required.</p>
          <Button
            onClick={() => router.push('/signup')}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90"
          >
            Get Started Now <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Status</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Docs</div>
                <div>Support</div>
                <div>API</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Privacy</div>
                <div>Terms</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex justify-between items-center text-sm text-slate-400">
            <div>2024 PrepPilot AI. All rights reserved.</div>
            <div className="flex gap-4">
              <div>Twitter</div>
              <div>GitHub</div>
              <div>LinkedIn</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
