'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { sampleProfiles } from '@/lib/sampleProfiles';
import { Activity, ArrowRight, Heart, Brain, Shield, Zap, ChevronDown, Sun, Moon, Sparkles } from 'lucide-react';
import BackgroundPaths from '@/components/layout/BackgroundPaths';

export default function LandingPage() {
  const router = useRouter();
  const { setProfile, computeAll, theme, toggleTheme, hasCompletedOnboarding } = useHealthStore();
  const [showProfiles, setShowProfiles] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [hasCompletedOnboarding, router]);

  const handleLoadProfile = (key: string) => {
    const profile = sampleProfiles[key];
    setProfile(profile);
    computeAll();
    router.push('/dashboard');
  };

  const features = [
    { icon: Heart, title: 'Biological Age', desc: 'Know your body\'s true age', color: 'from-red-500 to-pink-500' },
    { icon: Activity, title: 'Risk Prediction', desc: '5-10 year health forecasting', color: 'from-orange-500 to-yellow-500' },
    { icon: Brain, title: 'AI Coach', desc: 'Personalized recommendations', color: 'from-purple-500 to-indigo-500' },
    { icon: Zap, title: 'Simulation', desc: '"What if" habit scenarios', color: 'from-cyan-500 to-teal-500' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-grid-pattern">
      <BackgroundPaths />
      
      {/* Deep Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary-500/10 rounded-full blur-[140px] -top-[400px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-[120px] -bottom-[300px] pointer-events-none" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 transition-transform"
        id="landing-theme-toggle"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
      </button>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium dark:text-gray-300 text-gray-600">AI-Powered Preventive Health</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
          >
            <span className="gradient-text">VitalArc</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl dark:text-gray-400 text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed"
          >
            Your body&apos;s <span className="dark:text-primary-400 text-primary-700 font-semibold">check engine light</span>.
            Predict health risks, discover your biological age, and find the{' '}
            <span className="dark:text-primary-400 text-primary-700 font-semibold">one change</span> that matters most.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-sm dark:text-gray-500 text-gray-400 mb-10 flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Not a medical tool — educational insights only. Your data stays on your device.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <button
              onClick={() => router.push('/collector')}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
              id="start-journey-btn"
            >
              Start Your Health Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowProfiles(!showProfiles)}
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
              id="demo-profiles-btn"
            >
              Try Demo Profile
              <ChevronDown className={`w-5 h-5 transition-transform ${showProfiles ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>

          {/* Demo Profiles */}
          <AnimatePresence>
            {showProfiles && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap justify-center gap-3 mb-10"
              >
                {Object.entries(sampleProfiles).map(([key, profile]) => (
                  <motion.button
                    key={key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleLoadProfile(key)}
                    className="glass-card px-5 py-3 flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                      {profile.name?.[0]}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm dark:text-white text-gray-800">{profile.name}</div>
                      <div className="text-xs dark:text-gray-400 text-gray-500">
                        {profile.age}yo • {profile.gender} • Stress: {profile.stressLevel}/10
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full px-4 mt-8"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-5 text-center group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm dark:text-white text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-xs dark:text-gray-400 text-gray-500">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

          {/* Core Loop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-3 text-sm dark:text-gray-500 text-gray-400"
          >
            {['Measure', 'Predict', 'Simulate', 'Recommend'].map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-xs text-primary-400 font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </span>
                {i < 3 && <ArrowRight className="w-4 h-4 dark:text-gray-600 text-gray-300 hidden sm:block" />}
              </span>
            ))}
          </motion.div>
      </div>

      {/* Deep Dive Section */}
      <div className="relative z-10 py-24 px-4 bg-gray-50/50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold dark:text-white text-gray-800 mb-4">A complete view of your future.</h2>
            <p className="text-lg dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">We look past your chronological age to assess how your body is actually performing at an organ-by-organ level.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center mb-24">
            <div className="order-2 md:order-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-800 mb-4">True Biological Age</h3>
              <p className="text-lg dark:text-gray-400 text-gray-600 leading-relaxed mb-6">
                Not all organs age at the same rate. VitalArc calculates independent biological ages for your <strong>heart, brain, metabolism, and musculoskeletal system</strong> based on millions of data points and clinical algorithms.
              </p>
              <ul className="space-y-3">
                {['Organ-specific aging trajectories', 'Compare chronological vs biological', 'Identify your weakest link'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-square md:aspect-video rounded-3xl overflow-hidden glass-card p-2 shadow-2xl shadow-red-500/10">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/5 flex flex-col items-center justify-center p-8 text-center ring-1 ring-white/10">
                   <div className="text-sm dark:text-gray-400 text-gray-500 mb-2">Biological Age</div>
                   <div className="text-6xl md:text-8xl font-black text-red-400">42.5</div>
                   <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-bold">
                     +2.5 years older
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div>
              <div className="aspect-square md:aspect-video rounded-3xl overflow-hidden glass-card p-2 shadow-2xl shadow-cyan-500/10">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/5 flex flex-col items-center justify-center p-8 text-center ring-1 ring-white/10 relative overflow-hidden">
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-500/30 to-transparent" />
                   <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-50">
                     <svg viewBox="0 0 100 50" className="w-full h-32 preserve-3d stroke-cyan-400 stroke-2 fill-none"><path d="M0,50 Q25,10 50,30 T100,0" /></svg>
                   </div>
                   <div className="relative z-10 text-shadow-sm font-bold text-2xl text-cyan-400">See your future.</div>
                </div>
              </div>
            </div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-800 mb-4">Real-time Simulation</h3>
              <p className="text-lg dark:text-gray-400 text-gray-600 leading-relaxed mb-6">
                Wondering if cutting alcohol or walking 10k steps will actually help? Our real-time simulator lets you test habit changes and immediately see their 10-year impact on your body.
              </p>
              <button onClick={() => router.push('/collector')} className="text-cyan-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Try the Simulator <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t dark:border-white/10 border-gray-200 py-12 px-4 text-center dark:text-gray-500 text-gray-400 text-sm">
        <p className="mb-2">VitalArc © {new Date().getFullYear()} — Built for KLE Hackathon</p>
        <p className="max-w-2xl mx-auto opacity-60">
          Disclaimer: This platform uses statistical models and AI to estimate health risks. It is NOT a medical device. 
          Do not use this for medical diagnosis, treatment, or clinical decision-making. Always consult your doctor.
        </p>
      </footer>
    </div>
  );
}
