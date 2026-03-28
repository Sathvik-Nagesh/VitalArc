'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { TrendingUp, TrendingDown, Minus, Zap, Brain, Heart, Dumbbell, Activity } from 'lucide-react';
import BodyModel from '@/components/mirror/BodyModel';

function CountUpAnimation({ target, duration = 2.2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(1));

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [target, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}

const ORGAN_ICONS: Record<string, React.ElementType> = {
  cardiovascular: Heart,
  brain: Brain,
  musculoskeletal: Dumbbell,
  metabolic: Activity,
};

export default function MirrorPage() {
  const router = useRouter();
  const { profile, bioAge } = useHealthStore();
  const [revealed, setRevealed] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) { router.push('/'); return; }
    const timer = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(timer);
  }, [profile, router]);

  if (!profile || !bioAge) return (
    <AppLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Heart className="w-10 h-10 text-primary-500 mx-auto mb-3" />
          <p className="dark:text-gray-400 text-gray-500 text-center">Loading your bio-metrics...</p>
        </motion.div>
      </div>
    </AppLayout>
  );

  const isOlder = bioAge.delta > 0;
  const isYounger = bioAge.delta < 0;
  const isNeutral = bioAge.delta === 0;

  const deltaColor = bioAge.delta > 3 ? 'text-red-400' : bioAge.delta > 0 ? 'text-orange-400' : bioAge.delta > -3 ? 'text-cyan-400' : 'text-green-400';
  const deltaBorder = bioAge.delta > 3 ? 'border-red-500/40' : bioAge.delta > 0 ? 'border-orange-500/40' : bioAge.delta > -3 ? 'border-cyan-500/40' : 'border-green-500/40';
  const deltaGlow = bioAge.delta > 3 ? 'shadow-red-500/20' : bioAge.delta > 0 ? 'shadow-orange-500/20' : bioAge.delta > -3 ? 'shadow-cyan-500/20' : 'shadow-green-500/20';
  const deltaGradient = bioAge.delta > 3 ? 'from-red-500/15 via-red-500/5 to-transparent' : bioAge.delta > 0 ? 'from-orange-500/15 via-orange-500/5 to-transparent' : bioAge.delta > -3 ? 'from-cyan-500/15 via-cyan-500/5 to-transparent' : 'from-green-500/15 via-green-500/5 to-transparent';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-12 space-y-8">

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4 text-xs font-bold tracking-widest uppercase dark:text-primary-400 text-primary-600">
            <Zap className="w-3 h-3" /> Biological Age Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-black dark:text-white text-gray-900 tracking-tight">The Mirror</h1>
          <p className="dark:text-gray-400 text-gray-500 mt-2 text-lg">How fast is your body <em>really</em> aging?</p>
        </motion.div>

        {/* ── AGE REVEAL HERO ── */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 15 }}
          className={`glass-card relative overflow-hidden border-2 ${deltaBorder} shadow-2xl ${deltaGlow}`}
        >
          {/* Background gradient glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${deltaGradient}`} />
          {/* Top accent line */}
          <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${isOlder ? 'from-transparent via-red-500 to-transparent' : isYounger ? 'from-transparent via-green-500 to-transparent' : 'from-transparent via-cyan-500 to-transparent'}`} />
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">

              {/* Chronological Age */}
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-500 text-gray-400 mb-3">Actual Age</div>
                <div className="text-7xl md:text-8xl font-black dark:text-gray-300 text-gray-600 tabular-nums">
                  {bioAge.chronologicalAge}
                </div>
                <div className="text-sm dark:text-gray-500 text-gray-400 mt-2 font-medium">years old</div>
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl dark:text-gray-600 text-gray-300 hidden md:block"
              >→</motion.div>

              {/* Biological Age */}
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-500 text-gray-400 mb-3">Biological Age</div>
                <div className={`text-7xl md:text-9xl font-black tabular-nums ${deltaColor}`}>
                  {revealed ? <CountUpAnimation target={bioAge.biologicalAge} /> : <span className="opacity-30">??</span>}
                </div>
                <div className="text-sm dark:text-gray-500 text-gray-400 mt-2 font-medium">body&apos;s true age</div>
              </div>
            </div>

            {/* Delta pill */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 2, type: 'spring', stiffness: 200 }}
                  className="mt-10 flex flex-col items-center gap-3"
                >
                  <div className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border ${deltaBorder} backdrop-blur-sm ${deltaColor} text-2xl font-black`}>
                    {isOlder ? <TrendingUp className="w-7 h-7" /> : isYounger ? <TrendingDown className="w-7 h-7" /> : <Minus className="w-7 h-7" />}
                    {bioAge.delta > 0 ? '+' : ''}{bioAge.delta.toFixed(1)} years {isOlder ? 'older' : isYounger ? 'younger' : 'same'}
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-500 max-w-lg text-center leading-relaxed">
                    {bioAge.delta > 3 ? 'Your body is aging faster than expected. The right lifestyle changes can help reverse this trend.' :
                     bioAge.delta > 0 ? 'Slightly above your actual age. Small daily habits — sleep, exercise, stress — can make a meaningful difference.' :
                     bioAge.delta > -3 ? 'Great shape! Your biological clock is running slightly behind. Keep doing what you\'re doing.' :
                     'Exceptional! Your body is significantly younger than your chronological age. You\'re aging in reverse.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── 3D BODY + ORGAN AGES ── */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start"
            >
              {/* SVG Body */}
              <div className="lg:col-span-2 glass-card p-6 flex flex-col items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-4">
                  Organ Health Map
                </h2>
                <BodyModel selectedOrgan={hoveredOrgan} />
                <p className="text-xs dark:text-gray-500 text-gray-400 mt-4 text-center">
                  Hover an organ card to highlight it
                </p>
              </div>

              {/* Organ Age Cards */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500">
                  Organ-Level Biological Ages
                </h2>
                {bioAge.organAges.map((organ, i) => {
                  const Icon = ORGAN_ICONS[organ.organ] || Activity;
                  const isHovered = hoveredOrgan === organ.organ;
                  const organDelta = organ.delta;
                  const oBorderColor = organDelta > 3 ? 'border-l-red-500' : organDelta > 0 ? 'border-l-orange-400' : organDelta > -3 ? 'border-l-cyan-400' : 'border-l-green-400';
                  const oDeltaColor = organDelta > 3 ? 'text-red-400' : organDelta > 0 ? 'text-orange-400' : organDelta < 0 ? 'text-green-400' : 'text-gray-400';
                  const oBarColor = organDelta > 3 ? '#ef4444' : organDelta > 0 ? '#fb923c' : organDelta < 0 ? '#34d399' : '#9ca3af';

                  return (
                    <motion.div
                      key={organ.organ}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.5 + i * 0.1 }}
                      onHoverStart={() => setHoveredOrgan(organ.organ)}
                      onHoverEnd={() => setHoveredOrgan(null)}
                      whileHover={{ scale: 1.02 }}
                      className={`glass-card px-5 py-4 border-l-4 cursor-pointer transition-all ${oBorderColor} ${isHovered ? 'ring-1 ring-primary-500/30' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: organ.color + '20' }}>
                            <Icon className="w-5 h-5" style={{ color: organ.color }} />
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 text-gray-500">{organ.label}</div>
                            <div className="text-2xl font-black dark:text-white text-gray-800 tabular-nums leading-tight">
                              {organ.age.toFixed(1)} <span className="text-sm font-normal dark:text-gray-500 text-gray-400">yrs</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-right`}>
                          <div className={`text-xl font-black ${oDeltaColor}`}>
                            {organDelta > 0 ? '+' : ''}{organDelta.toFixed(1)}y
                          </div>
                          <div className="text-xs dark:text-gray-500 text-gray-400">
                            {organDelta > 0 ? 'aging faster' : organDelta < 0 ? 'aging slower' : 'on track'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 w-full h-1.5 rounded-full dark:bg-white/8 bg-gray-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(Math.abs(organDelta) * 8 + 45, 100)}%` }}
                          transition={{ duration: 1.2, delay: 2.6 + i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: oBarColor }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTRIBUTING FACTORS ── */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2 }}
            >
              <h2 className="text-sm font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-4">
                Contributing Factors
              </h2>
              <div className="glass-card p-6 grid md:grid-cols-2 gap-4">
                {bioAge.factors.map((factor, i) => {
                  const isGood = factor.status === 'good';
                  const isMod = factor.status === 'moderate';
                  const dotColor = isGood ? '#10b981' : isMod ? '#f59e0b' : '#ef4444';
                  const valColor = factor.impact < 0 ? 'text-green-400' : factor.impact > 0 ? 'text-red-400' : 'text-gray-400';
                  return (
                    <motion.div
                      key={factor.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.4 + i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-lg" style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}80` }} />
                      <span className="text-sm dark:text-gray-300 text-gray-600 flex-1">{factor.name}</span>
                      <span className={`text-sm font-bold ${valColor} tabular-nums`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}y
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
}
