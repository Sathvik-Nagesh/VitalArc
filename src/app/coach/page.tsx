'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { generateCoachRecommendations } from '@/engines/coachEngine';
import { verifyClinicalData } from '@/engines/verificationEngine';
import { rankHabitImpacts } from '@/engines/simulationEngine';
import AppLayout from '@/components/layout/AppLayout';
import { Brain, Star, Loader2, BookOpen, Sparkles, Volume2, VolumeX, ShieldCheck, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { renderIcon } from '@/lib/iconMap';

// Confidence Score Badge component
function ConfidenceBadge({ score, source, status }: { score: number; source: string; status: string }) {
  const color = status === 'verified' ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : status === 'caution' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-gray-400 bg-gray-500/10 border-gray-500/20';

  const icon = status === 'verified' ? <ShieldCheck className="w-3 h-3" />
    : status === 'caution' ? <AlertCircle className="w-3 h-3" />
    : <AlertCircle className="w-3 h-3" />;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${color}`}>
      {icon}
      <span>{score}% · {source}</span>
    </div>
  );
}

export default function CoachPage() {
  const router = useRouter();
  const { profile, bioAge, risks, healthScore, coachOutput, setCoachOutput, user } = useHealthStore();
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [remaining, setRemaining] = useState<number>(10);
  const [isAI, setIsAI] = useState(false);

  useEffect(() => { if (!profile) router.push('/'); }, [profile, router]);

  const generateRecommendations = async () => {
    if (!profile || !bioAge || !healthScore) return;
    setLoading(true);
    try {
      const impacts = rankHabitImpacts(profile);
      const output = await generateCoachRecommendations(
        profile, bioAge, risks, healthScore, impacts,
        undefined, // key is server-side now
        user?.uid || 'anonymous'
      );
      // @ts-ignore
      if (output.rateLimited) setRateLimited(true);
      // @ts-ignore
      if (output.remaining !== undefined) setRemaining(output.remaining);
      // @ts-ignore
      setIsAI(output.isAI || false);
      setCoachOutput(output);
    } catch (err) {
      console.error('Coach error:', err);
    }
    setLoading(false);
  };

  const speakRecommendations = () => {
    if (!coachOutput || typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (isSpeaking) { synth.cancel(); setIsSpeaking(false); return; }
    const text = `Here is your VitalArc health briefing. Your most important priority is: ${coachOutput.mostImportantChange}. ${coachOutput.futureStory}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synth.speak(utterance);
  };

  useEffect(() => {
    if (profile && bioAge && healthScore && !coachOutput && !loading) {
      generateRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, bioAge, healthScore]);

  // Clinical verification data
  const verifications = profile ? verifyClinicalData(profile) : [];
  const topVerification = verifications[0];

  if (!profile || !bioAge || !healthScore) return (
    <AppLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <p className="dark:text-gray-400 text-gray-500">Loading your health data...</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-400" /> AI Health Coach
            </h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">Privacy-safe recommendations · Data never shared with AI directly</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* AI Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${isAI ? 'bg-primary-500/10 text-primary-400' : 'bg-gray-500/10 text-gray-400'}`}>
              <Zap className="w-3 h-3" />
              {isAI ? 'Gemini AI Active' : 'Clinical Engine Active'}
            </div>
            {remaining < 10 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400">
                {remaining} AI calls remaining this hour
              </div>
            )}
            {coachOutput && !loading && (
              <button onClick={speakRecommendations} className={`btn-secondary text-sm flex items-center gap-2 ${isSpeaking ? 'bg-primary-500/20 ring-1 ring-primary-500/50' : ''}`}>
                {isSpeaking ? <VolumeX className="w-4 h-4 text-primary-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? 'Stop' : 'Listen'}
              </button>
            )}
            <button onClick={generateRecommendations} disabled={loading || rateLimited} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Analyzing...' : rateLimited ? 'Rate Limited' : 'Regenerate'}
            </button>
          </div>
        </motion.div>

        {/* Clinical Verification Panel */}
        {topVerification && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4 border border-green-500/10">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-green-400 mb-0.5">Clinical Verification</div>
                <p className="text-sm dark:text-gray-300 text-gray-600">{topVerification.medicalContext}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto md:ml-auto md:justify-end mt-2 md:mt-0">
              {verifications.map((v, i) => (
                <ConfidenceBadge key={i} score={v.confidenceScore} source={v.verifiedSource} status={v.status} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Rate limited warning */}
        {rateLimited && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6 border border-yellow-500/20 text-yellow-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            AI rate limit reached (5 calls/hr). Showing clinical engine results below — equally accurate, powered by AHA/WHO guidelines.
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <p className="dark:text-gray-400 text-gray-500 font-medium">Running anonymized analysis...</p>
              <p className="text-xs dark:text-gray-600 text-gray-400 mt-1">Your personal data stays on your device</p>
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
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  <span className="text-sm font-bold text-primary-400 uppercase tracking-wider">#1 Priority Change</span>
                </div>
                <p className="text-xl font-bold dark:text-white text-gray-800">{coachOutput.mostImportantChange}</p>
              </div>
            </motion.div>

            {/* 3 Recommendations */}
            {coachOutput.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`glass-card p-6 ${rec.isMostImportant ? 'ring-1 ring-primary-500/20' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg ${i === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' : i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' : 'bg-gradient-to-br from-amber-700 to-amber-800 text-white'}`}>
                    {renderIcon(rec.icon || 'Star', { className: "w-5 h-5" })}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600">{rec.category}</span>
                      {rec.isMostImportant && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">Top Priority</span>}
                      {/* Confidence score per recommendation */}
                      {verifications[0] && i === 0 && (
                        <ConfidenceBadge score={verifications[0].confidenceScore} source={verifications[0].verifiedSource.split(' ')[0]} status={verifications[0].status} />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-800 mb-3">{rec.action}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-black dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">Why This Matters</div>
                        <p className="text-sm dark:text-gray-300 text-gray-600">{rec.rationale}</p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="text-xs font-black dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">Estimated Impact</div>
                          <p className="text-sm text-primary-400 font-semibold">{rec.estimatedImpact}</p>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-black dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">How to Start Today</div>
                          <p className="text-sm dark:text-gray-300 text-gray-600">{rec.howToStart}</p>
                        </div>
                      </div>
                      {/* Citation link */}
                      {rec.citationUrl && (
                        <a
                          href={rec.citationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors mt-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {rec.citation || 'View Clinical Source'}
                        </a>
                      )}
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

            {/* Privacy Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center">
              <p className="text-[10px] dark:text-gray-600 text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                AI analysis uses anonymized health brackets only · No personal identifiers are ever transmitted
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
