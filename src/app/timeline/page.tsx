'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { runSimulation } from '@/engines/simulationEngine';
import AppLayout from '@/components/layout/AppLayout';
import { Clock, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, ReferenceArea } from 'recharts';

export default function TimelinePage() {
  const router = useRouter();
  const { profile, risks, simulatorValues } = useHealthStore();

  useEffect(() => { if (!profile) router.push('/'); }, [profile, router]);

  const timelineData = useMemo(() => {
    if (!profile || !simulatorValues) return [];
    const currentYear = new Date().getFullYear();
    const sim = runSimulation(profile, simulatorValues);
    const data = [];

    for (let offset = 0; offset <= 15; offset++) {
      const age = profile.age + offset;
      const year = currentYear + offset;

      // Calculate health trajectory
      const avgRisk = risks.reduce((s, r) => s + r.tenYearRisk, 0) / risks.length;
      const baseHealth = 100 - avgRisk;
      const decay = offset * (avgRisk / 40);
      const healthScore = Math.max(20, baseHealth - decay);

      // Find events for this age
      const events = sim.timelineEvents.filter(e => e.age === age);

      data.push({
        age,
        year,
        health: Math.round(healthScore * 10) / 10,
        events,
        hasWarning: events.some(e => e.severity === 'warning'),
        hasDanger: events.some(e => e.severity === 'danger'),
      });
    }
    return data;
  }, [profile, risks, simulatorValues]);

  if (!profile || timelineData.length === 0) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><p className="dark:text-gray-400 text-gray-500">Loading...</p></div></AppLayout>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 min-w-[200px]">
        <div className="font-semibold dark:text-white text-gray-800 mb-1">Age {data.age} ({data.year})</div>
        <div className="text-sm dark:text-gray-400 text-gray-500">Health: {data.health}/100</div>
        {data.events.map((e: { event: string; severity: string; probability: number }, i: number) => (
          <div key={i} className={`text-xs mt-1 ${e.severity === 'danger' ? 'text-red-400' : e.severity === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
            {e.severity === 'danger' ? '🔴' : e.severity === 'warning' ? '🟡' : '🟢'} {e.event} ({e.probability}%)
          </div>
        ))}
      </div>
    );
  };

  // Find danger/warning zones
  const dangerStart = timelineData.find(d => d.hasDanger)?.age;
  const warningStart = timelineData.find(d => d.hasWarning)?.age;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-24">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-6 shadow-lg shadow-cyan-500/20">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold dark:text-white text-gray-800 mb-4">Your Health Journey</h1>
          <p className="text-lg dark:text-gray-400 text-gray-500">A personalized projection of the next 15 years based on your current habits.</p>
        </motion.div>

        <div className="relative mt-12 px-4 md:px-0">
          {/* Central Line */}
          <div 
            className="absolute left-[40px] md:left-1/2 top-0 bottom-0 w-1 md:-ml-0.5 rounded-full bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 opacity-30" 
          />

          {timelineData.map((d, i) => {
            const hasEvents = d.events.length > 0;
            const isMilestone = i % 5 === 0 || i === 0 || i === timelineData.length - 1;
            
            // Only show years that have events, or are milestones (to reduce clutter)
            if (!hasEvents && !isMilestone) return null;

            const isLeft = i % 2 === 0;

            return (
              <motion.div 
                key={d.age}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`relative flex items-center justify-between w-full mb-12 md:mb-24 ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
              >
                {/* Empty side for layout on Desktop */}
                <div className="hidden md:block w-5/12" />

                {/* Center Node */}
                <div className="absolute left-[40px] md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 dark:border-[#0a0f18] border-gray-50 flex items-center justify-center z-10"
                     style={{ backgroundColor: d.hasDanger ? '#ef4444' : d.hasWarning ? '#f59e0b' : '#10b981' }}>
                   {hasEvents && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </div>

                {/* Content Card */}
                <div className="w-[calc(100%-80px)] md:w-5/12 ml-[80px] md:ml-0">
                  <div className={`glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${d.hasDanger ? 'ring-1 ring-red-500/30' : d.hasWarning ? 'ring-1 ring-yellow-500/30' : ''}`}>
                    {/* Background glow based on severity */}
                    <div className={`absolute -inset-4 opacity-0 group-hover:opacity-20 transition-opacity blur-xl ${d.hasDanger ? 'bg-red-500' : d.hasWarning ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-3xl font-black dark:text-white text-gray-800">Age {d.age}</div>
                          <div className="text-sm dark:text-gray-400 text-gray-500 font-medium">{d.year}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-wider font-bold dark:text-gray-500 text-gray-400 mb-1">Health Score</div>
                          <div className={`text-2xl font-bold ${d.health > 70 ? 'text-green-400' : d.health > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {d.health}
                          </div>
                        </div>
                      </div>

                      {hasEvents ? (
                        <div className="space-y-3 mt-4 pt-4 border-t dark:border-white/10 border-gray-200">
                          {d.events.map((event, eventIdx) => (
                            <div key={eventIdx} className="flex gap-3 items-start">
                              <div className="mt-0.5">
                                {event.severity === 'danger' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : 
                                 event.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : 
                                 <ShieldCheck className="w-5 h-5 text-green-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium dark:text-gray-200 text-gray-800">{event.event}</p>
                                <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">{event.probability}% probability</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm dark:text-gray-500 text-gray-400 italic mt-2">Stable health. Expected signs of typical aging.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
