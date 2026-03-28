'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { renderIcon } from '@/lib/iconMap';
import BodyModel from '@/components/mirror/BodyModel';

function CountUpAnimation({ target, duration = 2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(1));

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    return controls.stop;
  }, [target, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function MirrorPage() {
  const router = useRouter();
  const { profile, bioAge } = useHealthStore();
  const [revealed, setRevealed] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) { router.push('/'); return; }
    const timer = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(timer);
  }, [profile, router]);

  if (!profile || !bioAge) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><p className="dark:text-gray-400 text-gray-500">Loading...</p></div></AppLayout>;

  const deltaColor = bioAge.delta > 3 ? 'text-red-400' : bioAge.delta > 0 ? 'text-orange-400' : bioAge.delta > -3 ? 'text-cyan-400' : 'text-green-400';
  const deltaBg = bioAge.delta > 3 ? 'from-red-500/20 to-red-500/5' : bioAge.delta > 0 ? 'from-orange-500/20 to-orange-500/5' : bioAge.delta > -3 ? 'from-cyan-500/20 to-cyan-500/5' : 'from-green-500/20 to-green-500/5';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-red-400" /> The Mirror
          </h1>
          <p className="dark:text-gray-400 text-gray-500 mt-1">Your biological age reveals how fast your body is truly aging</p>
        </motion.div>

        {/* Main Age Reveal */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 100 }} className="glass-card p-8 md:p-12 text-center mb-8 relative overflow-hidden">
          {/* Background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${deltaBg} opacity-50`} />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {/* Chronological */}
              <div>
                <div className="text-sm dark:text-gray-400 text-gray-500 mb-2">Chronological Age</div>
                <div className="text-6xl md:text-7xl font-black dark:text-white text-gray-800">{bioAge.chronologicalAge}</div>
                <div className="text-sm dark:text-gray-500 text-gray-400 mt-1">years old</div>
              </div>

              {/* Arrow */}
              <div className="text-4xl dark:text-gray-600 text-gray-300">→</div>

              {/* Biological */}
              <div>
                <div className="text-sm dark:text-gray-400 text-gray-500 mb-2">Biological Age</div>
                <div className={`text-6xl md:text-8xl font-black ${deltaColor}`}>
                  {revealed ? <CountUpAnimation target={bioAge.biologicalAge} /> : '??.?'}
                </div>
                <div className="text-sm dark:text-gray-500 text-gray-400 mt-1">body&apos;s true age</div>
              </div>
            </div>

            {/* Delta */}
            {revealed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="mt-8">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${deltaBg} ${deltaColor} text-xl font-bold`}>
                  {bioAge.delta > 0 ? <TrendingUp className="w-6 h-6" /> : bioAge.delta < 0 ? <TrendingDown className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
                  {bioAge.delta > 0 ? '+' : ''}{bioAge.delta.toFixed(1)} years {bioAge.delta > 0 ? 'older' : bioAge.delta < 0 ? 'younger' : 'same'}
                </div>
                <p className="mt-3 text-sm dark:text-gray-400 text-gray-500 max-w-md mx-auto">
                  {bioAge.delta > 3 ? 'Your body is aging faster than expected. Lifestyle changes could help reverse this.' :
                   bioAge.delta > 0 ? 'Slightly above your actual age. Small habits can make a big difference.' :
                   bioAge.delta > -3 ? 'Great! Your body is slightly younger than your age.' :
                   'Excellent! You\'re aging slower than expected. Keep up the great work!'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 3D Body Model and Organ Ages Split */}
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card flex items-center justify-center p-4">
              <BodyModel selectedOrgan={hoveredOrgan} />
            </div>
            
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-semibold dark:text-white text-gray-800 mb-4">Organ-Level Ages</h2>
              <div className="space-y-4">
                {bioAge.organAges.map((organ, i) => {
                  const organDeltaColor = organ.delta > 3 ? 'border-red-500' : organ.delta > 0 ? 'border-orange-500' : organ.delta > -3 ? 'border-cyan-500' : 'border-green-500';
                  return (
                    <motion.div 
                      key={organ.organ} 
                      onHoverStart={() => setHoveredOrgan(organ.organ)}
                      onHoverEnd={() => setHoveredOrgan(null)}
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 2.7 + i * 0.15 }} 
                      className={`glass-card p-5 border-l-4 cursor-pointer hover:bg-white/5 transition-colors ${organDeltaColor}`}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span style={{ color: organ.color }}>{renderIcon(organ.icon, { className: "w-8 h-8" })}</span>
                        <div>
                          <div className="text-sm dark:text-gray-400 text-gray-500">{organ.label}</div>
                          <div className="text-2xl font-bold dark:text-white text-gray-800">{organ.age.toFixed(1)} <span className="text-sm font-normal dark:text-gray-500 text-gray-400">years</span></div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${organ.delta > 0 ? 'text-red-400' : organ.delta < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                        {organ.delta > 0 ? '+' : ''}{organ.delta.toFixed(1)}y
                      </div>
                    </div>
                    {/* Progress bar showing deviation */}
                    <div className="mt-3 w-full h-2 rounded-full dark:bg-white/10 bg-gray-200 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(Math.abs(organ.delta) * 10 + 50, 100)}%` }} transition={{ duration: 1, delay: 2.9 + i * 0.15 }} className="h-full rounded-full" style={{ backgroundColor: organ.color, opacity: 0.7 }} />
                    </div>
                  </motion.div>
                );
              })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Contributing Factors */}
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }} className="mt-8">
            <h2 className="text-xl font-semibold dark:text-white text-gray-800 mb-4">Contributing Factors</h2>
            <div className="glass-card p-5">
              <div className="space-y-3">
                {bioAge.factors.map((factor) => (
                  <div key={factor.name} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${factor.status === 'good' ? 'bg-green-500' : factor.status === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="text-sm dark:text-gray-300 text-gray-600 flex-1">{factor.name}</span>
                    <span className={`text-sm font-semibold ${factor.impact < 0 ? 'text-green-400' : factor.impact > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}y
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
