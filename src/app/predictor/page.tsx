'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { Activity, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PredictorPage() {
  const router = useRouter();
  const { profile, risks } = useHealthStore();

  useEffect(() => { if (!profile) router.push('/'); }, [profile, router]);
  if (!profile || risks.length === 0) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><p className="dark:text-gray-400 text-gray-500">Loading...</p></div></AppLayout>;

  const confidenceColors: Record<string, string> = { low: 'bg-gray-500', medium: 'bg-yellow-500', high: 'bg-green-500' };
  const severityColors: Record<string, string> = { low: 'text-green-400', moderate: 'text-yellow-400', high: 'text-orange-400', 'very-high': 'text-red-400' };
  const severityBg: Record<string, string> = { low: 'from-green-500/10', moderate: 'from-yellow-500/10', high: 'from-orange-500/10', 'very-high': 'from-red-500/10' };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-2"><Activity className="w-8 h-8 text-orange-400" /> Risk Predictor</h1>
          <p className="dark:text-gray-400 text-gray-500 mt-1">Your 5-year and 10-year health risk predictions</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {risks.map((risk, i) => (
            <motion.div key={risk.shortName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className={`glass-card p-6 relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${severityBg[risk.severity]} to-transparent opacity-50`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{risk.icon}</span>
                    <div>
                      <h3 className="font-semibold dark:text-white text-gray-800">{risk.condition}</h3>
                      <p className="text-xs dark:text-gray-400 text-gray-500">{risk.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${confidenceColors[risk.confidence]}`} />
                    <span className="text-xs dark:text-gray-500 text-gray-400">{risk.confidence}</span>
                  </div>
                </div>

                {/* Risk gauges */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs dark:text-gray-400 text-gray-500 mb-1">5-Year Risk</div>
                    <div className={`text-3xl font-bold ${severityColors[risk.severity]}`}>{risk.fiveYearRisk}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs dark:text-gray-400 text-gray-500 mb-1">10-Year Risk</div>
                    <div className={`text-3xl font-bold ${severityColors[risk.severity]}`}>{risk.tenYearRisk}%</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs dark:text-gray-500 text-gray-400 mb-1"><span>5-Year</span><span>{risk.fiveYearRisk}%</span></div>
                    <div className="w-full h-2 rounded-full dark:bg-white/10 bg-gray-200 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(risk.fiveYearRisk, 100)}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: risk.color }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs dark:text-gray-500 text-gray-400 mb-1"><span>10-Year</span><span>{risk.tenYearRisk}%</span></div>
                    <div className="w-full h-2 rounded-full dark:bg-white/10 bg-gray-200 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(risk.tenYearRisk, 100)}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ backgroundColor: risk.color, opacity: 0.7 }} />
                    </div>
                  </div>
                </div>

                {/* Severity badge */}
                <div className="mt-4 flex items-center gap-2">
                  {risk.severity === 'low' ? <ShieldCheck className="w-4 h-4 text-green-400" /> :
                   risk.severity === 'very-high' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                   <Shield className="w-4 h-4 text-yellow-400" />}
                  <span className={`text-sm font-medium ${severityColors[risk.severity]}`}>{risk.severity.replace('-', ' ').toUpperCase()} RISK</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 glass-card p-4 text-center">
          <p className="text-xs dark:text-gray-500 text-gray-400">
            Risk predictions use simplified models for educational purposes. Confidence levels are based on data completeness. Consult healthcare professionals for actual risk assessment.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
