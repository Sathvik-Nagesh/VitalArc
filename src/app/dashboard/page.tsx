'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { Heart, Brain, Flame, Dumbbell, Activity, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { renderIcon } from '@/lib/iconMap';

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return '#10b981';
    if (s >= 70) return '#22d3ee';
    if (s >= 55) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-700/20 dark:text-gray-700/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={getColor(animatedScore)} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="score-ring" style={{ filter: `drop-shadow(0 0 8px ${getColor(animatedScore)}40)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black dark:text-white text-gray-800">{Math.round(animatedScore)}</span>
        <span className="text-xs dark:text-gray-400 text-gray-500 font-medium">Health Score</span>
      </div>
    </div>
  );
}

function OrganAgeCard({ label, icon, age, delta, color }: { label: string; icon: string; age: number; delta: number; color: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="glass-card p-4 flex items-center gap-3">
      <div className="flex-shrink-0" style={{ color }}>{renderIcon(icon, { className: "w-6 h-6" })}</div>
      <div className="flex-1">
        <div className="text-xs dark:text-gray-400 text-gray-500 mb-0.5">{label}</div>
        <div className="font-bold text-lg dark:text-white text-gray-800">{age.toFixed(1)} <span className="text-xs font-normal">years</span></div>
      </div>
      <div className={`text-sm font-semibold px-2 py-1 rounded-lg ${delta > 0 ? 'bg-red-500/10 text-red-400' : delta < 0 ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`} style={{ borderLeft: `3px solid ${color}` }}>
        {delta > 0 ? '+' : ''}{delta.toFixed(1)}y
      </div>
    </motion.div>
  );
}

function RiskMiniCard({ condition, risk, severity, icon }: { condition: string; risk: number; severity: string; icon: string }) {
  const colors: Record<string, string> = { low: 'bg-green-500', moderate: 'bg-yellow-500', high: 'bg-orange-500', 'very-high': 'bg-red-500' };
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={colors[severity].replace('bg-', 'text-')}>{renderIcon(icon, { className: "w-5 h-5" })}</span>
        <span className="text-sm font-medium dark:text-gray-300 text-gray-600">{condition}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold dark:text-white text-gray-800">{risk.toFixed(1)}%</span>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${colors[severity]}`}>{severity}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-700/30 mt-2 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(risk, 100)}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${colors[severity]}`} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, bioAge, healthScore, risks, habitImpacts } = useHealthStore();

  useEffect(() => {
    if (!profile) router.push('/');
  }, [profile, router]);

  if (!profile || !bioAge || !healthScore) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
               <Activity className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-lg font-semibold dark:text-white text-gray-800">Initializing Health Engine</h2>
            <p className="dark:text-gray-400 text-gray-500 text-sm mt-1">Calculating your 10-year trajectory...</p>
            <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
               <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-full bg-primary-500 rounded-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const topImpact = habitImpacts[0];
  const primaryRisk = risks.reduce((max, r) => r.tenYearRisk > max.tenYearRisk ? r : max, risks[0]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-12">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b dark:border-white/5 border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black dark:text-white text-gray-800 tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <span className="gradient-text">{profile.name?.split(' ')[0] || 'User'}</span>.
            </h1>
            <p className="dark:text-gray-400 text-gray-500 mt-2 text-lg">Your health baseline is calculated and active.</p>
          </div>
          <Link href="/simulator" className="btn-primary flex items-center gap-2 px-6 shadow-lg shadow-primary-500/20">
             Explore Sandbox <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 flex flex-col justify-between group hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                 <Heart className="w-6 h-6 text-cyan-400" />
               </div>
               <span className="text-xs uppercase tracking-wider font-bold dark:text-gray-500 text-gray-400">Biological Age</span>
            </div>
            <div>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-5xl font-black dark:text-white text-gray-800">{bioAge.biologicalAge.toFixed(1)}</span>
                <span className="text-lg dark:text-gray-400 text-gray-500 pb-1">yo</span>
              </div>
              <p className="text-sm dark:text-gray-400 text-gray-500 flex items-center gap-2 mt-3">
                 <span className={`px-2 py-0.5 rounded-md font-medium text-xs ${bioAge.delta > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {bioAge.delta > 0 ? '+' : ''}{bioAge.delta.toFixed(1)} yrs
                 </span>
                 vs chronological
              </p>
            </div>
            <Link href="/mirror" className="mt-6 text-sm text-cyan-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Detailed Analysis <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 flex flex-col justify-between group hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                 <Activity className="w-6 h-6 text-green-400" />
               </div>
               <span className="text-xs uppercase tracking-wider font-bold dark:text-gray-500 text-gray-400">Health Score</span>
            </div>
            <div>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-5xl font-black dark:text-white text-gray-800">{Math.round(healthScore.overall)}</span>
                <span className="text-lg dark:text-gray-400 text-gray-500 pb-1">/ 100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: `${healthScore.overall}%` }} />
              </div>
            </div>
            <div className="mt-6 text-sm dark:text-gray-400 text-gray-500 flex justify-between items-center">
               <span>Grade Rating</span>
               <span className="font-bold dark:text-white text-gray-800 text-xl">{healthScore.grade}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-8 flex flex-col justify-between group hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                 <Flame className="w-6 h-6 text-orange-400" />
               </div>
               <span className="text-xs uppercase tracking-wider font-bold dark:text-gray-500 text-gray-400">Top Priority</span>
            </div>
            <div>
              <h3 className="text-xl font-bold dark:text-white text-gray-800 leading-tight mb-2">
                 {topImpact ? topImpact.label : 'Maintain Current Routine'}
              </h3>
              <p className="text-sm dark:text-gray-400 text-gray-500 line-clamp-2">
                 {topImpact ? `Targeting this habit first will yield a massive ${topImpact.riskReduction}% risk reduction and dock ${topImpact.bioAgeImpact} years off your biological age.` : 'Your vitals are stable. Keep logging daily to track trends.'}
              </p>
            </div>
            <Link href="/coach" className="mt-6 text-sm text-orange-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Get AI Plan <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
          
        </div>

        {/* Action Highlights Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
           
           {/* Timeline Insight */}
           <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                 <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                 <h3 className="text-xl font-bold dark:text-white text-gray-800 mb-2">Predictive Timeline</h3>
                 <p className="dark:text-gray-400 text-gray-600 text-sm mb-4 leading-relaxed">
                   Your 15-year prognosis indicates your highest isolated risk is <strong>{primaryRisk.condition}</strong> ({primaryRisk.tenYearRisk.toFixed(1)}%). See exact trajectory milestones.
                 </p>
                 <Link href="/timeline" className="text-sm font-semibold text-blue-500 hover:text-blue-400">View Future Prognosis →</Link>
              </div>
           </div>

           {/* Daily Tracker Intro */}
           <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                 <Dumbbell className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                 <h3 className="text-xl font-bold dark:text-white text-gray-800 mb-2">Daily Calibration</h3>
                 <p className="dark:text-gray-400 text-gray-600 text-sm mb-4 leading-relaxed">
                   Track your sleep, mood, and daily choices. Consistent logging allows the AI engine to refine its predictions with high confidence accuracy.
                 </p>
                 <Link href="/tracker" className="text-sm font-semibold text-purple-500 hover:text-purple-400">Log Today's Data →</Link>
              </div>
           </div>

        </motion.div>
      </div>
    </AppLayout>
  );
}
