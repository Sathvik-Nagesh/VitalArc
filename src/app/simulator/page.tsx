'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { rankHabitImpacts } from '@/engines/simulationEngine';
import AppLayout from '@/components/layout/AppLayout';
import { SlidersHorizontal, ArrowRight, RotateCcw, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { SimulatorValues } from '@/lib/types';

export default function SimulatorPage() {
  const router = useRouter();
  const { profile, bioAge, healthScore, simulatorValues, setSimulatorValues, simulatedBioAge, simulatedScore, simulatedRisks, risks } = useHealthStore();
  const [localValues, setLocalValues] = useState<SimulatorValues | null>(null);
  const [impacts, setImpacts] = useState(useHealthStore.getState().habitImpacts);

  useEffect(() => { if (!profile) router.push('/'); }, [profile, router]);

  useEffect(() => {
    if (simulatorValues && !localValues) setLocalValues(simulatorValues);
  }, [simulatorValues, localValues]);

  useEffect(() => {
    if (profile) setImpacts(rankHabitImpacts(profile));
  }, [profile]);

  const handleChange = useCallback((field: keyof SimulatorValues, value: number | string) => {
    if (!localValues) return;
    const updated = { ...localValues, [field]: value };
    setLocalValues(updated);
    setSimulatorValues(updated);
  }, [localValues, setSimulatorValues]);

  const handleReset = () => {
    if (!profile) return;
    const defaults: SimulatorValues = {
      sleepHours: profile.sleepHours,
      exerciseDaysPerWeek: profile.exerciseDaysPerWeek,
      dietQuality: profile.dietQuality,
      stressLevel: profile.stressLevel,
      smokingStatus: profile.smokingStatus,
    };
    setLocalValues(defaults);
    setSimulatorValues(defaults);
  };

  if (!profile || !bioAge || !healthScore || !localValues) {
    return <AppLayout><div className="flex items-center justify-center h-[60vh]"><p className="dark:text-gray-400 text-gray-500">Loading...</p></div></AppLayout>;
  }

  const bioAgeDelta = simulatedBioAge ? (simulatedBioAge - bioAge.biologicalAge) : 0;
  const scoreDelta = simulatedScore ? (simulatedScore - healthScore.overall) : 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-2"><SlidersHorizontal className="w-8 h-8 text-cyan-400" /> Habit Simulator</h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">See how lifestyle changes affect your health in real-time</p>
          </div>
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> Reset</button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
            {/* Sleep */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium dark:text-gray-300 text-gray-600">😴 Sleep</label>
                <span className="text-sm font-bold text-primary-400">{localValues.sleepHours}h</span>
              </div>
              <input type="range" min={3} max={10} step={0.5} value={localValues.sleepHours} onChange={e => handleChange('sleepHours', parseFloat(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs dark:text-gray-600 text-gray-400 mt-1"><span>3h</span><span>10h</span></div>
            </div>

            {/* Exercise */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium dark:text-gray-300 text-gray-600">🏃 Exercise</label>
                <span className="text-sm font-bold text-primary-400">{localValues.exerciseDaysPerWeek} days/wk</span>
              </div>
              <input type="range" min={0} max={7} value={localValues.exerciseDaysPerWeek} onChange={e => handleChange('exerciseDaysPerWeek', parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs dark:text-gray-600 text-gray-400 mt-1"><span>0</span><span>7</span></div>
            </div>

            {/* Diet */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium dark:text-gray-300 text-gray-600">🥗 Diet Quality</label>
                <span className="text-sm font-bold text-primary-400">{localValues.dietQuality}/10</span>
              </div>
              <input type="range" min={1} max={10} value={localValues.dietQuality} onChange={e => handleChange('dietQuality', parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs dark:text-gray-600 text-gray-400 mt-1"><span>Poor</span><span>Excellent</span></div>
            </div>

            {/* Stress */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium dark:text-gray-300 text-gray-600">🧘 Stress Level</label>
                <span className="text-sm font-bold text-primary-400">{localValues.stressLevel}/10</span>
              </div>
              <input type="range" min={1} max={10} value={localValues.stressLevel} onChange={e => handleChange('stressLevel', parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs dark:text-gray-600 text-gray-400 mt-1"><span>😌 Calm</span><span>😰 High</span></div>
            </div>

            {/* Smoking */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium dark:text-gray-300 text-gray-600 mb-3 block">🚭 Smoking Status</label>
              <div className="flex gap-2">
                {(['never', 'former', 'current'] as const).map(s => (
                  <button key={s} onClick={() => handleChange('smokingStatus', s)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${localValues.smokingStatus === s ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30' : 'dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            {/* Before vs After */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 text-center">
                <div className="text-xs dark:text-gray-400 text-gray-500 mb-1">Current Bio Age</div>
                <div className="text-4xl font-black dark:text-white text-gray-800">{bioAge.biologicalAge.toFixed(1)}</div>
                <div className="text-xs dark:text-gray-500 text-gray-400">Score: {healthScore.overall}</div>
              </div>
              <div className="glass-card p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
                <div className="relative z-10">
                  <div className="text-xs dark:text-gray-400 text-gray-500 mb-1">Simulated Bio Age</div>
                  <div className={`text-4xl font-black ${bioAgeDelta < 0 ? 'text-green-400' : bioAgeDelta > 0 ? 'text-red-400' : 'dark:text-white text-gray-800'}`}>
                    {simulatedBioAge?.toFixed(1)}
                  </div>
                  <div className="text-xs dark:text-gray-500 text-gray-400">Score: {simulatedScore}</div>
                </div>
              </div>
            </div>

            {/* Delta display */}
            {(bioAgeDelta !== 0 || scoreDelta !== 0) && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-5 flex items-center justify-around">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    {bioAgeDelta < 0 ? <TrendingDown className="w-5 h-5 text-green-400" /> : <TrendingUp className="w-5 h-5 text-red-400" />}
                    <span className={`text-2xl font-bold ${bioAgeDelta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bioAgeDelta > 0 ? '+' : ''}{bioAgeDelta.toFixed(1)}y
                    </span>
                  </div>
                  <div className="text-xs dark:text-gray-400 text-gray-500">Bio Age Change</div>
                </div>
                <div className="w-px h-10 dark:bg-white/10 bg-gray-200" />
                <div className="text-center">
                  <div className={`text-2xl font-bold ${scoreDelta > 0 ? 'text-green-400' : scoreDelta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                  </div>
                  <div className="text-xs dark:text-gray-400 text-gray-500">Score Change</div>
                </div>
              </motion.div>
            )}

            {/* Risk comparison */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold dark:text-white text-gray-800 mb-3">Risk Comparison</h3>
              <div className="space-y-3">
                {risks.map((risk, i) => {
                  const simRisk = simulatedRisks[i];
                  const riskDelta = simRisk ? simRisk.tenYearRisk - risk.tenYearRisk : 0;
                  return (
                    <div key={risk.shortName} className="flex items-center gap-3">
                      <span className="text-lg">{risk.icon}</span>
                      <span className="text-sm dark:text-gray-300 text-gray-600 w-24">{risk.shortName}</span>
                      <span className="text-sm dark:text-gray-400 text-gray-500 w-16">{risk.tenYearRisk}%</span>
                      <ArrowRight className="w-4 h-4 dark:text-gray-600 text-gray-300" />
                      <span className="text-sm font-semibold dark:text-white text-gray-800 w-16">{simRisk?.tenYearRisk || risk.tenYearRisk}%</span>
                      {riskDelta !== 0 && (
                        <span className={`text-xs font-semibold ${riskDelta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ({riskDelta > 0 ? '+' : ''}{riskDelta.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact Ranking */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold dark:text-white text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" /> One Change Impact Ranking
              </h3>
              <div className="space-y-2">
                {impacts.slice(0, 5).map((impact, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const isTop = i === 0;
                  return (
                    <motion.div key={impact.habit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`flex items-center gap-3 p-3 rounded-xl ${isTop ? 'bg-primary-500/10 ring-1 ring-primary-500/20' : 'dark:bg-white/3 bg-gray-50'}`}>
                      <span className="text-xl">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                      <span className="text-lg">{impact.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium dark:text-white text-gray-800">{impact.label}</div>
                        {isTop && <div className="text-xs text-primary-400 font-medium">👉 THE ONE most impactful change</div>}
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-green-400">-{impact.bioAgeImpact}y</div>
                        <div className="text-cyan-400">+{impact.scoreImpact}pts</div>
                      </div>
                    </motion.div>
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
