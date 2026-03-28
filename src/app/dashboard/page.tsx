'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { Heart, Brain, Flame, Dumbbell, Activity, ArrowRight, TrendingUp, TrendingDown, Zap, Calendar, Clock, Printer } from 'lucide-react';
import Link from 'next/link';
import InteractiveBody, { type OrganData } from '@/components/anatomy/InteractiveBody';
import HealthRadar from '@/components/charts/HealthRadar';

const ORGAN_SHORT: Record<string, string> = {
  cardiovascular: 'Cardiovascular system shows elevated bio-age due to high BP and low exercise.',
  brain: 'Cognitive markers indicate accelerated aging from sleep deficit and stress load.',
  metabolic: 'Metabolic organ age driven by diet quality and glucose handling efficiency.',
  musculoskeletal: 'Muscle and bone aging profile from movement frequency and body composition.',
  lungs: 'Respiratory capacity estimated from cardiovascular and lifestyle markers.',
};

function MetricCard({ label, value, unit, subtitle, color, icon: Icon, href }: {
  label: string; value: string; unit?: string; subtitle: string;
  color: string; icon: React.ElementType; href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="glass-card p-5 cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-8"
          style={{ background: `radial-gradient(circle, ${color}60, transparent)` }} />
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <ArrowRight className="w-4 h-4 dark:text-gray-600 text-gray-300 group-hover:translate-x-1 transition-transform" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-500 text-gray-400 mb-1">{label}</div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-black dark:text-white text-gray-900 tabular-nums">{value}</span>
          {unit && <span className="text-sm dark:text-gray-400 text-gray-500 mb-0.5">{unit}</span>}
        </div>
        <div className="text-xs dark:text-gray-400 text-gray-500 mt-1 leading-snug">{subtitle}</div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, bioAge, healthScore, risks, habitImpacts } = useHealthStore();
  const [selectedOrgan, setSelectedOrgan] = useState<OrganData | null>(null);

  useEffect(() => {
    if (!profile) router.push('/');
  }, [profile, router]);

  if (!profile || !bioAge || !healthScore) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[65vh]">
          <div className="text-center max-w-xs">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto mb-5"
            >
              <Activity className="w-9 h-9 text-primary-400" />
            </motion.div>
            <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-2">Initializing Health Engine</h2>
            <p className="dark:text-gray-400 text-gray-500 text-sm mb-5">Processing your 10-year trajectory...</p>
            <div className="w-full dark:bg-white/8 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2 }}
                className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const topImpact = habitImpacts[0];
  const topRisk = risks.reduce((max, r) => r.tenYearRisk > max.tenYearRisk ? r : max, risks[0]);
  const deltaColor = bioAge.delta > 3 ? '#ef4444' : bioAge.delta > 0 ? '#f97316' : bioAge.delta > -3 ? '#00d4aa' : '#10b981';

  const organList: OrganData[] = [
    ...bioAge.organAges.map(o => ({
      id: o.organ, label: o.label, age: o.age, delta: o.delta, color: o.color,
      description: ORGAN_SHORT[o.organ] ?? '',
    })),
    {
      id: 'lungs', label: 'Lungs',
      age: bioAge.organAges.find(o => o.organ === 'cardiovascular')?.age ?? bioAge.chronologicalAge,
      delta: (bioAge.organAges.find(o => o.organ === 'cardiovascular')?.delta ?? 0) * 0.7,
      color: '#60a5fa', description: ORGAN_SHORT['lungs'],
    }
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-10">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between border-b dark:border-white/6 border-gray-100 pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-400 mb-1">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-black dark:text-white text-gray-900 tracking-tight">
              {profile.name?.split(' ')[0] ?? 'User'}&apos;s Health Dashboard
            </h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">Your real-time biological health overview</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => window.print()} className="btn-secondary hidden md:flex items-center gap-2 px-6">
                <Printer className="w-4 h-4" /> Export Report
             </button>
             <Link href="/simulator" className="btn-primary hidden md:flex items-center gap-2 px-6 shadow-glow shadow-primary-500/20">
                <Zap className="w-4 h-4" /> Explore Sandbox
             </Link>
          </div>
        </motion.div>

        {/* ── MAIN 3-PANEL LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_1fr] gap-6 items-start">

          {/* LEFT: Metric Cards */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Bio Age" value={bioAge.biologicalAge.toFixed(1)} unit="yrs"
                subtitle={`${bioAge.delta > 0 ? '+' : ''}${bioAge.delta.toFixed(1)}y vs your actual age`}
                color={deltaColor} icon={Heart} href="/mirror"
              />
              <MetricCard
                label="Health Score" value={Math.round(healthScore.overall).toString()} unit="/100"
                subtitle={`Grade: ${healthScore.grade} — ${healthScore.overall >= 70 ? 'Good standing' : 'Needs work'}`}
                color="#10b981" icon={Activity} href="/predictor"
              />
            </div>

            {/* Top Risk Banner */}
            <motion.div whileHover={{ y: -2 }} className="glass-card p-5 relative overflow-hidden border-l-4 border-orange-500/60">
              <div className="absolute right-0 top-0 bottom-0 w-24 opacity-5"
                style={{ background: 'linear-gradient(to left, #f97316, transparent)' }} />
              <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-2">Highest Risk Detected</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-black dark:text-white text-gray-900">{topRisk.condition}</div>
                  <div className="text-sm text-orange-400 font-bold">{topRisk.tenYearRisk.toFixed(1)}% 10-year risk</div>
                </div>
                <Link href="/predictor" className="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="mt-3 w-full h-2 rounded-full dark:bg-white/8 bg-gray-200 overflow-hidden">
                <motion.div initial={{ width: 0 }}
                  animate={{ width: `${Math.min(topRisk.tenYearRisk, 100)}%` }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              </div>
            </motion.div>

            {/* Top Habit Impact */}
            {topImpact && (
              <motion.div whileHover={{ y: -2 }} className="glass-card p-5 border-l-4 border-primary-500/60">
                <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-2">
                  #1 Most Impactful Action
                </div>
                <div className="text-lg font-black dark:text-white text-gray-900 mb-1">{topImpact.label}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400 font-bold">-{topImpact.bioAgeImpact}y bio-age</span>
                  <span className="dark:text-gray-600 text-gray-300">·</span>
                  <span className="text-cyan-400 font-bold">+{topImpact.scoreImpact} score</span>
                  <span className="dark:text-gray-600 text-gray-300">·</span>
                  <span className="text-blue-400 font-bold">-{topImpact.riskReduction}% risk</span>
                </div>
              </motion.div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/timeline', icon: Clock, label: 'Timeline', desc: '15-yr prognosis', color: '#3b82f6' },
                { href: '/tracker', icon: Calendar, label: 'Daily Log', desc: 'Track today', color: '#a855f7' },
              ].map(l => (
                <Link key={l.href} href={l.href}>
                  <motion.div whileHover={{ y: -3 }} className="glass-card p-4 cursor-pointer">
                    <l.icon className="w-5 h-5 mb-2" style={{ color: l.color }} />
                    <div className="text-sm font-bold dark:text-white text-gray-800">{l.label}</div>
                    <div className="text-xs dark:text-gray-400 text-gray-500">{l.desc}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* CENTER: Anatomy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-4 md:p-6"
            style={{
              borderColor: selectedOrgan ? selectedOrgan.color + '40' : undefined,
              boxShadow: selectedOrgan ? `0 0 50px ${selectedOrgan.color}12` : undefined,
              transition: 'border-color 0.4s, box-shadow 0.4s',
            }}
          >
            <InteractiveBody organs={organList} onSelect={setSelectedOrgan} selectedId={selectedOrgan?.id ?? null} />
          </motion.div>

          {/* RIGHT: Health Balance Radar or Organ Detail */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
             {/* Radar Card (Always Shown if no specific organ selected) */}
             {!selectedOrgan && (
                <div className="glass-card p-5 relative overflow-hidden bg-gradient-to-br from-primary-500/5 to-transparent">
                   <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-2">Systemic Balance</div>
                   <HealthRadar data={[
                      { label: 'Cardio', value: Math.max(0, 100 - ((bioAge.organAges.find(o => o.organ === 'cardiovascular')?.delta ?? 0) * 8)) },
                      { label: 'Neuro', value: Math.max(0, 100 - ((bioAge.organAges.find(o => o.organ === 'brain')?.delta ?? 0) * 8)) },
                      { label: 'Metabolic', value: Math.max(0, 100 - ((bioAge.organAges.find(o => o.organ === 'metabolic')?.delta ?? 0) * 8)) },
                      { label: 'Muscular', value: Math.max(0, 100 - ((bioAge.organAges.find(o => o.organ === 'musculoskeletal')?.delta ?? 0) * 8)) },
                   ]} />
                   <div className="mt-4 text-[10px] text-center dark:text-gray-500 text-gray-400 italic">High symmetry indicates multi-system resilience.</div>
                </div>
             )}

            <AnimatePresence mode="wait">
              {selectedOrgan ? (
                <motion.div key="organ" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-5" style={{ borderColor: selectedOrgan.color + '40', boxShadow: `0 0 30px ${selectedOrgan.color}10` }}>
                  <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-3">
                    {selectedOrgan.label} Analysis
                  </div>
                  <div className="text-4xl font-black tabular-nums mb-1" style={{ color: selectedOrgan.color }}>
                    {selectedOrgan.age.toFixed(1)} <span className="text-base font-normal dark:text-gray-400 text-gray-500">yrs</span>
                  </div>
                  <div className={`text-lg font-bold mb-3 ${selectedOrgan.delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedOrgan.delta > 0 ? '+' : ''}{selectedOrgan.delta.toFixed(1)}y vs actual age
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-600 leading-relaxed mb-4">
                    {ORGAN_SHORT[selectedOrgan.id] ?? 'Biological age estimate for this organ system.'}
                  </p>
                  <Link href="/mirror" className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5">
                    Full Analysis <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card p-5">
                  <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500 mb-3">Organ Ages Overview</div>
                  <div className="space-y-2.5">
                    {bioAge.organAges.map((o, i) => {
                      const sc = o.delta > 3 ? '#ef4444' : o.delta > 0 ? '#f97316' : '#10b981';
                      return (
                        <motion.div key={o.organ} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium dark:text-gray-300 text-gray-600">{o.label}</span>
                              <span className="font-bold tabular-nums" style={{ color: sc }}>
                                {o.delta > 0 ? '+' : ''}{o.delta.toFixed(1)}y
                              </span>
                            </div>
                            <div className="w-full dark:bg-white/6 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Math.abs(o.delta) * 7 + 40, 100)}%` }}
                                transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: sc }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <Link href="/mirror" className="mt-4 btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5">
                    Full Mirror Analysis <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Habit Leaderboard */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-widest dark:text-gray-400 text-gray-500">Impact Ranking</div>
                <Link href="/simulator" className="text-xs text-primary-400 font-semibold hover:text-primary-300">Simulate →</Link>
              </div>
              <div className="space-y-2">
                {habitImpacts.slice(0, 3).map((impact, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={impact.habit} className="flex items-center gap-3 py-2 border-b dark:border-white/4 border-gray-100 last:border-0">
                      <span className="text-base">{medals[i]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold dark:text-white text-gray-800 truncate">{impact.label}</div>
                        <div className="text-xs dark:text-gray-500 text-gray-400">-{impact.bioAgeImpact}y · -{impact.riskReduction}% risk</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
