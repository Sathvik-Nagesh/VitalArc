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
  const statusLabel = organ.delta > 3 ? 'Critical Decay' : organ.delta > 0 ? 'Accelerated Aging' : organ.delta > -3 ? 'System Optimal' : 'Youthful Reserve';

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col"
    >
      {/* Visual Header */}
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-6 p-2">
          <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden" style={{ border: `2px solid ${statusColor}40`, background: `linear-gradient(135deg, ${statusColor}15 0%, transparent 100%)` }}>
            <Icon className="w-8 h-8 relative z-10" style={{ color: statusColor }} />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-dashed opacity-20" style={{ borderColor: statusColor }} />
          </div>
          <div>
             <h2 className="text-3xl font-black dark:text-white text-gray-900 tracking-tighter">{organ.label} System</h2>
             <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: statusColor }}>{statusLabel}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-6 flex flex-col items-center border-t-2" style={{ borderColor: statusColor + '40' }}>
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Biological Clock</div>
             <div className="text-5xl font-black tracking-tighter gradient-text" style={{ backgroundImage: `linear-gradient(to bottom, ${statusColor}, white)` }}>{organ.age.toFixed(1)}</div>
             <div className="text-xs font-bold text-gray-500 mt-1">years</div>
          </div>
          <div className="glass-card p-6 flex flex-col items-center border-t-2" style={{ borderColor: isOlder ? '#ef444440' : '#10b98140' }}>
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Age Delta</div>
             <div className={`text-5xl font-black tracking-tighter ${isOlder ? 'text-red-400' : 'text-green-400'}`}>
                {isOlder ? '+' : ''}{organ.delta.toFixed(1)}
             </div>
             <div className="text-xs font-bold text-gray-500 mt-1">relative variance</div>
          </div>
      </div>

      {/* Narrative Section */}
      <div className="glass-card p-6 mb-6 flex-1 bg-black/5 dark:bg-white/[0.02]">
         <div className="flex items-center gap-2 mb-4">
            <Microscope className="w-4 h-4 text-primary-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Clinical Impact</span>
         </div>
         <p className="text-sm dark:text-gray-300 text-gray-600 leading-relaxed italic border-l-2 pl-4" style={{ borderColor: statusColor }}>
           &quot;{ORGAN_DESC[organ.id] || 'System functioning within population normal limits.'}&quot;
         </p>
         
         <div className="mt-8 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Longevity Strategy</div>
            <div className="p-4 rounded-2xl bg-primary-500/5 ring-1 ring-primary-500/10 flex items-start gap-3">
               <Zap className="w-5 h-5 text-primary-400 shrink-0" />
               <div className="text-xs dark:text-gray-300 text-gray-600">
                  Targeted {organ.label} optimization can reduce overall bio-age by up to <strong>1.4 years</strong> in the next 12 months.
               </div>
            </div>
         </div>
      </div>

      <Link href="/simulator" className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg group">
         <SlidersHorizontal className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
         Run {organ.label} Simulation
      </Link>
    </motion.div>
  );
}

// Re-defining ICON_MAP with Microscope just in case
import { Microscope, SlidersHorizontal } from 'lucide-react';

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
