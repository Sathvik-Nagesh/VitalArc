'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { TrendingUp, TrendingDown, Minus, Heart, Brain, Dumbbell, Activity, Wind, Zap, ArrowRight } from 'lucide-react';
import InteractiveBody, { type OrganData } from '@/components/anatomy/InteractiveBody';
import Link from 'next/link';

function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(1));
  useEffect(() => {
    const c = animate(count, target, { duration, ease: 'easeOut' });
    return c.stop;
  }, [target, duration, count]);
  return <motion.span>{rounded}</motion.span>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  cardiovascular: Heart,
  brain: Brain,
  musculoskeletal: Dumbbell,
  metabolic: Activity,
  lungs: Wind,
};

const ORGAN_DESC: Record<string, string> = {
  cardiovascular: 'Tracks heart rate variability, cardiovascular load, and arterial health based on your BP, resting HR, and exercise patterns.',
  brain: 'Assesses cognitive aging through sleep quality, stress markers, and mental health history — key drivers of neurological longevity.',
  metabolic: 'Evaluates liver, gut, and hormone health through diet quality, glucose markers, and cholesterol patterns.',
  musculoskeletal: 'Estimates bone density and muscle mass trajectory from exercise frequency, BMI, and movement patterns.',
  lungs: 'Respiratory health evaluation from smoking status, cardio endurance, and vital capacity estimates.',
};

function OrganDetailPanel({ organ, chronologicalAge }: { organ: OrganData; chronologicalAge: number }) {
  const Icon = ICON_MAP[organ.id] ?? Activity;
  const isOlder = organ.delta > 0;
  const statusColor = organ.delta > 3 ? '#ef4444' : organ.delta > 0 ? '#f97316' : organ.delta > -3 ? '#00d4aa' : '#10b981';
  const statusLabel = organ.delta > 3 ? 'Needs Attention' : organ.delta > 0 ? 'Slightly Elevated' : organ.delta > -3 ? 'On Track' : 'Optimal';

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b dark:border-white/8 border-gray-100">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: organ.color + '25', border: `1.5px solid ${organ.color}50` }}>
          <Icon className="w-7 h-7" style={{ color: organ.color }} />
        </div>
        <div>
          <h3 className="text-xl font-black dark:text-white text-gray-900">{organ.label}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColor + '20', color: statusColor }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Age comparison */}
      <div className="glass-card p-5 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 80% 50%, ${organ.color}30, transparent 70%)` }} />
        <div className="relative flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-1">Organ Bio-Age</div>
            <div className="text-5xl font-black tabular-nums" style={{ color: organ.color }}>
              {organ.age.toFixed(1)}
              <span className="text-lg font-normal dark:text-gray-400 text-gray-500 ml-1">yrs</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-1">vs Chronological</div>
            <div className={`flex items-center gap-1 text-2xl font-black ${isOlder ? 'text-red-400' : 'text-green-400'}`}>
              {isOlder ? <TrendingUp className="w-5 h-5" /> : organ.delta < 0 ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              {organ.delta > 0 ? '+' : ''}{organ.delta.toFixed(1)}y
            </div>
            <div className="text-xs dark:text-gray-500 text-gray-400">{chronologicalAge} actual age</div>
          </div>
        </div>

        {/* Mini bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs dark:text-gray-500 text-gray-400 mb-1">
            <span>Age deviation</span>
            <span>{Math.abs(organ.delta).toFixed(1)} yrs {isOlder ? 'ahead' : 'behind'}</span>
          </div>
          <div className="w-full h-2 rounded-full dark:bg-white/8 bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(organ.delta) * 8 + 40, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: statusColor }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="glass-card p-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-2">What This Measures</div>
        <p className="text-sm dark:text-gray-300 text-gray-600 leading-relaxed">{ORGAN_DESC[organ.id] ?? 'Health data for this organ system.'}</p>
      </div>

      {/* Action */}
      <div className="mt-auto">
        <Link href="/simulator" className="btn-primary w-full flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> Simulate Improvements
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function DefaultRightPanel({ bioAge }: { bioAge: { organAges: Array<{ organ: string; label: string; age: number; delta: number; color: string }> } }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-4">All Organ Systems</div>
      <div className="space-y-3">
        {bioAge.organAges.map((organ, i) => {
          const Icon = ICON_MAP[organ.organ] ?? Activity;
          const statusColor = organ.delta > 3 ? '#ef4444' : organ.delta > 0 ? '#f97316' : organ.delta < 0 ? '#10b981' : '#00d4aa';
          return (
            <motion.div
              key={organ.organ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 glass-card px-4 py-3"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: organ.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: organ.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold dark:text-white text-gray-800 truncate">{organ.label}</div>
                <div className="text-xs dark:text-gray-400 text-gray-500">{organ.age.toFixed(1)} bio-years</div>
              </div>
              <div className="text-sm font-bold tabular-nums" style={{ color: statusColor }}>
                {organ.delta > 0 ? '+' : ''}{organ.delta.toFixed(1)}y
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 p-4 rounded-2xl dark:bg-white/3 bg-gray-50 border dark:border-white/5 border-gray-100">
        <p className="text-xs dark:text-gray-400 text-gray-500 leading-relaxed text-center">
          Click an organ on the body to see detailed analysis and improvement opportunities.
        </p>
      </div>
    </motion.div>
  );
}

export default function MirrorPage() {
  const router = useRouter();
  const { profile, bioAge } = useHealthStore();
  const [revealed, setRevealed] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganData | null>(null);

  useEffect(() => {
    if (!profile) { router.push('/'); return; }
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, [profile, router]);

  if (!profile || !bioAge) return (
    <AppLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-center">
          <Heart className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="dark:text-gray-400 text-gray-500">Analyzing your biology...</p>
        </motion.div>
      </div>
    </AppLayout>
  );

  const deltaColor = bioAge.delta > 3 ? 'text-red-400' : bioAge.delta > 0 ? 'text-orange-400' : bioAge.delta > -3 ? 'text-cyan-400' : 'text-green-400';
  const deltaBorderColor = bioAge.delta > 3 ? '#ef4444' : bioAge.delta > 0 ? '#f97316' : bioAge.delta > -3 ? '#00d4aa' : '#10b981';

  // Build organs list for InteractiveBody - add lungs synthesized from cardiovascular
  const organList: OrganData[] = [
    ...bioAge.organAges.map(o => ({
      id: o.organ,
      label: o.label,
      age: o.age,
      delta: o.delta,
      color: o.color,
      description: ORGAN_DESC[o.organ] ?? '',
    })),
    // Synthesize lungs from cardiovascular for visualization richness
    {
      id: 'lungs',
      label: 'Lungs',
      age: bioAge.organAges.find(o => o.organ === 'cardiovascular')?.age ?? bioAge.chronologicalAge,
      delta: (bioAge.organAges.find(o => o.organ === 'cardiovascular')?.delta ?? 0) * 0.7,
      color: '#60a5fa',
      description: ORGAN_DESC['lungs'],
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight">Biological Mirror</h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1 text-sm">Interactive organ-level biological age analysis</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="glass-card px-5 py-3 flex items-center gap-3"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500">Bio Age</div>
              <div className={`text-3xl font-black tabular-nums ${deltaColor}`}>
                {revealed ? <CountUp target={bioAge.biologicalAge} /> : <span className="opacity-30">--</span>}
              </div>
            </div>
            <div className="w-px h-10 dark:bg-white/10 bg-gray-200" />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500">Actual</div>
              <div className="text-3xl font-black dark:text-gray-200 text-gray-700 tabular-nums">{bioAge.chronologicalAge}</div>
            </div>
            <div className="w-px h-10 dark:bg-white/10 bg-gray-200" />
            <div className={`flex items-center gap-1 text-xl font-black ${deltaColor}`}>
              {bioAge.delta > 0 ? <TrendingUp className="w-5 h-5" /> : bioAge.delta < 0 ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              {bioAge.delta > 0 ? '+' : ''}{bioAge.delta.toFixed(1)}y
            </div>
          </motion.div>
        </motion.div>

        {/* ── 3-PANEL LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">

          {/* ── LEFT PANEL: Health Factors ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            
            {/* Overall score card */}
            <div className="glass-card p-5 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, ${deltaBorderColor}, transparent)` }} />
              <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-4">Assessment Summary</div>
              
              {/* Delta ring visual */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="dark:text-white/6 text-gray-200" />
                    <motion.circle cx="40" cy="40" r="32" fill="none"
                      stroke={deltaBorderColor} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - Math.min(Math.abs(bioAge.delta) / 15, 1)) }}
                      transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                      style={{ filter: `drop-shadow(0 0 6px ${deltaBorderColor}60)` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black" style={{ color: deltaBorderColor }}>
                      {bioAge.delta > 0 ? '+' : ''}{bioAge.delta.toFixed(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm dark:text-gray-300 text-gray-700 font-medium leading-snug">
                    {bioAge.delta > 3 ? 'Lifestyle changes can help reverse aging acceleration.' :
                     bioAge.delta > 0 ? 'Minor changes can bring your biological age in line.' :
                     bioAge.delta > -3 ? 'Your body is doing well. Keep maintaining habits.' :
                     'Exceptional aging profile. You\'re a longevity outlier.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contributing factors list */}
            <div className="glass-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-4">Key Factors</div>
              <div className="space-y-3">
                {bioAge.factors.slice(0, 6).map((factor, i) => {
                  const isGood = factor.status === 'good';
                  const dotColor = isGood ? '#10b981' : factor.status === 'moderate' ? '#f59e0b' : '#ef4444';
                  return (
                    <motion.div key={factor.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dotColor, boxShadow: `0 0 5px ${dotColor}` }} />
                      <span className="text-sm dark:text-gray-300 text-gray-600 flex-1 leading-tight">{factor.name}</span>
                      <span className={`text-xs font-bold tabular-nums ${factor.impact < 0 ? 'text-green-400' : factor.impact > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}y
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/simulator">
                <motion.div whileHover={{ y: -3, scale: 1.02 }} className="glass-card p-4 cursor-pointer text-center">
                  <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xs font-bold dark:text-gray-200 text-gray-700">Simulator</div>
                  <div className="text-[10px] dark:text-gray-500 text-gray-400">What-if scenarios</div>
                </motion.div>
              </Link>
              <Link href="/coach">
                <motion.div whileHover={{ y: -3, scale: 1.02 }} className="glass-card p-4 cursor-pointer text-center">
                  <Brain className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <div className="text-xs font-bold dark:text-gray-200 text-gray-700">AI Coach</div>
                  <div className="text-[10px] dark:text-gray-500 text-gray-400">Get action plan</div>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* ── CENTER: Interactive Anatomy ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 md:p-6 flex flex-col items-center w-full lg:w-[300px]"
            style={{
              borderColor: selectedOrgan ? selectedOrgan.color + '40' : undefined,
              boxShadow: selectedOrgan ? `0 0 40px ${selectedOrgan.color}15` : undefined,
            }}
          >
            <AnimatePresence>
              {revealed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <InteractiveBody
                    organs={organList}
                    onSelect={setSelectedOrgan}
                    selectedId={selectedOrgan?.id ?? null}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT PANEL: Organ Detail or Overview ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 min-h-[520px]"
          >
            <AnimatePresence mode="wait">
              {selectedOrgan ? (
                <OrganDetailPanel key={selectedOrgan.id} organ={selectedOrgan} chronologicalAge={bioAge.chronologicalAge} />
              ) : (
                <DefaultRightPanel key="default" bioAge={bioAge} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
