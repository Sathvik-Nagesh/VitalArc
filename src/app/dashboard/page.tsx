'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { Heart, Brain, Flame, Dumbbell, Activity, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

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
      <div className="text-2xl">{icon}</div>
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
        <span className="text-lg">{icon}</span>
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
          <div className="text-center">
            <Activity className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
            <p className="dark:text-gray-400 text-gray-500">Loading your health data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const topImpact = habitImpacts[0];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-800">
              Welcome back, <span className="gradient-text">{profile.name || 'User'}</span>
            </h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">Here&apos;s your health overview</p>
          </div>
          <Link href="/simulator" className="btn-primary flex items-center gap-2 w-fit">
            <span>🔮</span> What If Simulation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Top Row: Score + Bio Age + One Change */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex flex-col items-center">
            <ScoreRing score={healthScore.overall} />
            <div className="mt-3 text-center">
              <span className="text-2xl font-bold gradient-text mr-2">Grade: {healthScore.grade}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full mt-4 text-center">
              <div><div className="text-xs dark:text-gray-500 text-gray-400">Bio Age</div><div className="text-sm font-semibold dark:text-white text-gray-800">{healthScore.breakdown.bioAgeScore}</div></div>
              <div><div className="text-xs dark:text-gray-500 text-gray-400">Risk</div><div className="text-sm font-semibold dark:text-white text-gray-800">{healthScore.breakdown.riskScore}</div></div>
              <div><div className="text-xs dark:text-gray-500 text-gray-400">Lifestyle</div><div className="text-sm font-semibold dark:text-white text-gray-800">{healthScore.breakdown.lifestyleScore}</div></div>
            </div>
          </motion.div>

          {/* Biological Age */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col items-center justify-center">
            <div className="text-sm dark:text-gray-400 text-gray-500 mb-2">Biological Age</div>
            <div className="text-6xl font-black dark:text-white text-gray-800">{bioAge.biologicalAge.toFixed(1)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm dark:text-gray-400 text-gray-500">vs {bioAge.chronologicalAge} actual</span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${bioAge.delta > 0 ? 'bg-red-500/10 text-red-400' : bioAge.delta < 0 ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                {bioAge.delta > 0 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                {bioAge.delta > 0 ? '+' : ''}{bioAge.delta.toFixed(1)} years
              </span>
            </div>
            <Link href="/mirror" className="mt-4 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View Bio Age Details <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* #1 Impact */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full blur-xl" />
            <div className="text-xs dark:text-gray-400 text-gray-500 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              Your #1 Most Impactful Change
            </div>
            {topImpact && (
              <>
                <div className="text-3xl mb-2">🥇</div>
                <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-1">{topImpact.label}</h3>
                <div className="space-y-1 text-sm dark:text-gray-400 text-gray-500">
                  <p>Bio age: <span className="text-green-400 font-semibold">-{topImpact.bioAgeImpact}y</span></p>
                  <p>Score: <span className="text-cyan-400 font-semibold">+{topImpact.scoreImpact}</span></p>
                  <p>Risk: <span className="text-blue-400 font-semibold">-{topImpact.riskReduction}%</span></p>
                </div>
                <Link href="/simulator" className="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                  Explore in Simulator <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Organ Ages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold dark:text-white text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" /> Organ Ages
            </h2>
            <Link href="/mirror" className="text-xs text-primary-400 hover:text-primary-300">View Details →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bioAge.organAges.map((organ) => (
              <OrganAgeCard key={organ.organ} label={organ.label} icon={organ.icon} age={organ.age} delta={organ.delta} color={organ.color} />
            ))}
          </div>
        </motion.div>

        {/* Risks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold dark:text-white text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" /> Top Health Risks (10-Year)
            </h2>
            <Link href="/predictor" className="text-xs text-primary-400 hover:text-primary-300">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {risks.map((risk) => (
              <RiskMiniCard key={risk.shortName} condition={risk.shortName} risk={risk.tenYearRisk} severity={risk.severity} icon={risk.icon} />
            ))}
          </div>
        </motion.div>

        {/* Impact Ranking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold dark:text-white text-gray-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Impact Ranking
            </h2>
            <Link href="/simulator" className="text-xs text-primary-400 hover:text-primary-300">Simulate →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {habitImpacts.slice(0, 3).map((impact,i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <motion.div key={impact.habit} whileHover={{ scale: 1.02 }} className={`glass-card p-4 ${i === 0 ? 'ring-1 ring-primary-500/30' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{medals[i]}</span>
                    <span className="text-2xl">{impact.icon}</span>
                    <span className="text-sm font-semibold dark:text-white text-gray-800">{impact.label}</span>
                  </div>
                  <div className="flex gap-3 text-xs dark:text-gray-400 text-gray-500">
                    <span>Bio: <span className="text-green-400">-{impact.bioAgeImpact}y</span></span>
                    <span>Score: <span className="text-cyan-400">+{impact.scoreImpact}</span></span>
                    <span>Risk: <span className="text-blue-400">-{impact.riskReduction}%</span></span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/timeline', icon: '🔮', label: 'Health Timeline', desc: 'See your future trajectory' },
            { href: '/coach', icon: '🧠', label: 'AI Coach', desc: 'Get personalized advice' },
            { href: '/simulator', icon: '⚡', label: 'Habit Simulator', desc: 'Test what-if scenarios' },
            { href: '/tracker', icon: '📅', label: 'Daily Tracker', desc: 'Log today\'s habits' },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.div whileHover={{ y: -3 }} className="glass-card p-4 cursor-pointer h-full">
                <span className="text-2xl">{link.icon}</span>
                <h3 className="text-sm font-semibold dark:text-white text-gray-800 mt-2">{link.label}</h3>
                <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">{link.desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
