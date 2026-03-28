'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { generateCoachRecommendations } from '@/engines/coachEngine';
import { rankHabitImpacts } from '@/engines/simulationEngine';
import AppLayout from '@/components/layout/AppLayout';
import { Brain, Star, Loader2, Key, BookOpen } from 'lucide-react';

export default function CoachPage() {
  const router = useRouter();
  const { profile, bioAge, risks, healthScore, coachOutput, setCoachOutput, geminiApiKey, setGeminiApiKey } = useHealthStore();
  const [loading, setLoading] = useState(false);
  const [showApiInput, setShowApiInput] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey);

  useEffect(() => { if (!profile) router.push('/'); }, [profile, router]);

  const generateRecommendations = async () => {
    if (!profile || !bioAge || !healthScore) return;
    setLoading(true);
    try {
      const impacts = rankHabitImpacts(profile);
      const output = await generateCoachRecommendations(profile, bioAge, risks, healthScore, impacts, geminiApiKey || undefined);
      setCoachOutput(output);
    } catch (err) {
      console.error('Coach error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile && bioAge && healthScore && !coachOutput && !loading) {
      generateRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, bioAge, healthScore]);

  if (!profile || !bioAge || !healthScore) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><p className="dark:text-gray-400 text-gray-500">Loading...</p></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-2"><Brain className="w-8 h-8 text-purple-400" /> AI Health Coach</h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">Personalized recommendations based on your health data</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowApiInput(!showApiInput)} className="btn-secondary text-sm flex items-center gap-2"><Key className="w-4 h-4" /> {geminiApiKey ? 'API Set ✓' : 'Set API Key'}</button>
            <button onClick={generateRecommendations} disabled={loading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Regenerate'}
            </button>
          </div>
        </motion.div>

        {/* API Key Input */}
        {showApiInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 mb-6">
            <label className="text-sm dark:text-gray-300 text-gray-600 block mb-2">Gemini API Key (optional — enables AI-powered recommendations)</label>
            <div className="flex gap-2">
              <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="Enter your Gemini API key" className="flex-1 px-4 py-2 rounded-xl dark:bg-white/5 bg-gray-100 dark:text-white text-gray-800 border dark:border-white/10 border-gray-200 focus:border-primary-500 focus:outline-none text-sm" />
              <button onClick={() => { setGeminiApiKey(tempKey); setShowApiInput(false); }} className="btn-primary text-sm">Save</button>
            </div>
            <p className="text-xs dark:text-gray-500 text-gray-400 mt-2">Without an API key, recommendations use our built-in rule-based engine (still excellent!)</p>
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="dark:text-gray-400 text-gray-500">Analyzing your health data...</p>
              <p className="text-xs dark:text-gray-600 text-gray-400 mt-1">Generating personalized recommendations</p>
            </div>
          </div>
        )}

        {coachOutput && !loading && (
          <div className="space-y-6">
            {/* #1 Most Important Change */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 relative overflow-hidden ring-1 ring-primary-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👉</span>
                  <span className="text-sm font-bold text-primary-400 uppercase tracking-wider">#1 Most Important Change</span>
                </div>
                <p className="text-xl font-bold dark:text-white text-gray-800">{coachOutput.mostImportantChange}</p>
              </div>
            </motion.div>

            {/* 3 Recommendations */}
            {coachOutput.recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className={`glass-card p-6 ${rec.isMostImportant ? 'ring-1 ring-primary-500/20' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${rec.isMostImportant ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-amber-700 to-amber-800'}`}>
                      {rec.icon || (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600">{rec.category}</span>
                      {rec.isMostImportant && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">Most Important</span>}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-800 mb-2">{rec.action}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">Why This Matters for You</div>
                        <p className="text-sm dark:text-gray-300 text-gray-600">{rec.rationale}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">Estimated Impact</div>
                        <p className="text-sm text-primary-400 font-medium">{rec.estimatedImpact}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">How to Start Today</div>
                        <p className="text-sm dark:text-gray-300 text-gray-600">{rec.howToStart}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Future Story */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-bold dark:text-white text-gray-800 uppercase tracking-wider">Your Future Story</span>
                </div>
                <p className="text-sm dark:text-gray-300 text-gray-600 leading-relaxed italic">&quot;{coachOutput.futureStory}&quot;</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
