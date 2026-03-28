'use client';

import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Calendar, Heart, Shield, Zap, TrendingUp, AlertTriangle, Activity, Brain } from 'lucide-react';

export default function TimelinePage() {
  const { profile, bioAge, risks } = useHealthStore();

  if (!profile || !bioAge) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="w-20 h-20 rounded-3xl dark:bg-white/5 bg-gray-100 flex items-center justify-center mb-6 border dark:border-white/10 border-gray-200">
            <Calendar className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white text-gray-800">Timeline Locked</h2>
          <p className="dark:text-gray-400 text-gray-500 max-w-sm mt-2 font-light">Complete your health scan to view your longevity trajectory.</p>
        </div>
      </AppLayout>
    );
  }

  const chronologicalAge = profile.age;
  const healthspanEnd = Math.max(chronologicalAge + 5, 80 - (bioAge.delta * 0.8));
  const lifespanEnd = Math.max(healthspanEnd + 5, 90 - (bioAge.delta * 0.5));

  const timelineYears = Array.from({ length: 11 }, (_, i) => Math.round(chronologicalAge + (i * (lifespanEnd - chronologicalAge) / 10)));

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black dark:text-white text-gray-900 tracking-tighter mb-4">Longevity Trajectory</h1>
          <p className="dark:text-gray-400 text-gray-500 font-light text-lg">Your healthspan and lifespan projections based on current clinical markers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timeline Chart */}
          <div className="lg:col-span-2 glass-card p-10 relative overflow-hidden bg-gradient-to-br from-primary-500/5 to-transparent">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <TrendingUp className="w-48 h-48" />
             </div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-16">
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-2">Projected Lifespan</div>
                      <div className="text-7xl font-black dark:text-white text-gray-900 tracking-tighter leading-none">
                         {Math.round(lifespanEnd)} <span className="text-3xl text-gray-500">y/o</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-400 mb-2">Healthy Years left</div>
                      <div className="text-5xl font-black dark:text-gray-200 text-gray-700 tracking-tighter leading-none">
                         {Math.max(0, Math.round(healthspanEnd - chronologicalAge))}
                      </div>
                   </div>
                </div>

                {/* Timeline Bar */}
                <div className="relative h-24 mb-16 pt-12">
                  {/* Axis */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 rounded-full -translate-y-1/2" />
                  
                  {/* Healthspan Section */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((healthspanEnd - chronologicalAge) / (lifespanEnd - chronologicalAge)) * 100}%` }}
                    className="absolute top-1/2 left-0 h-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full -translate-y-1/2 shadow-glow shadow-primary-500/20"
                  />

                  {/* Indicators */}
                  <div className="absolute top-1/2 left-0 w-4 h-4 rounded-full bg-white border-4 border-primary-500 -translate-x-1/2 -translate-y-1/2" title="Now" />
                  
                  <div className="absolute top-0 flex flex-col items-center" style={{ left: `${((healthspanEnd - chronologicalAge) / (lifespanEnd - chronologicalAge)) * 100}%` }}>
                     <div className="w-px h-12 bg-accent-500/50" />
                     <div className="absolute -top-10 text-[10px] font-black whitespace-nowrap text-accent-400 uppercase tracking-widest">End of High Performance</div>
                     <Shield className="w-5 h-5 text-accent-500 mt-2" />
                  </div>

                  <div className="absolute top-1/2 right-0 w-4 h-4 rounded-full bg-white border-4 border-gray-400 translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Axis Labels */}
                <div className="flex justify-between px-2">
                   {timelineYears.map((year, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="h-2 w-px bg-white/20" />
                        <span className="text-[10px] font-bold text-gray-500">{year}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Key Milestones */}
          <div className="space-y-6">
             <div className="glass-card p-8 border-l-4 border-red-500">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-black text-xl dark:text-white text-gray-900 tracking-tight">Risk Threshold</h3>
               </div>
               <p className="text-sm dark:text-gray-400 text-gray-500 leading-relaxed font-light">
                 Your clinical markers suggest a metabolic shift at age <span className="font-bold text-red-400">{Math.round(chronologicalAge + 8)}</span> if current stress and weight patterns persist.
               </p>
             </div>

             <div className="glass-card p-8 border-l-4 border-primary-500">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                     <Zap className="w-6 h-6 text-primary-500" />
                   </div>
                   <h3 className="font-black text-xl dark:text-white text-gray-900 tracking-tight">Vigor Peak</h3>
                </div>
                <p className="text-sm dark:text-gray-400 text-gray-500 leading-relaxed font-light">
                  Assuming 5 days of zone 2 exercise per week, your "Peak Years" (high vigor, low decay) can be extended from age <span className="font-bold text-primary-400">{Math.round(healthspanEnd)}</span> to <span className="font-bold text-primary-400">{Math.round(healthspanEnd + 4)}</span>.
                </p>
             </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pb-24">
           {[
             { l: 'Cellular Decay Rate', v: '0.9x', i: Activity, c: 'text-blue-400' },
             { l: 'Epigenetic Drift', v: '+0.1y', i: Brain, c: 'text-purple-400' },
             { l: 'Cardiac Reserve', v: 'High', i: Heart, c: 'text-red-400' },
             { l: 'Systemic Resilience', v: 'Good', i: Shield, c: 'text-green-400' },
           ].map((stat, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -5 }}
               className="glass-card p-6 flex flex-col items-center gap-2 text-center"
             >
                <stat.i className={`w-5 h-5 ${stat.c} mb-2`} />
                <div className="text-xs uppercase font-black text-gray-500 tracking-[0.2em]">{stat.l}</div>
                <div className="text-3xl font-black dark:text-white text-gray-800">{stat.v}</div>
             </motion.div>
           ))}
        </div>
      </div>
    </AppLayout>
  );
}
