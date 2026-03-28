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
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-2"><Clock className="w-8 h-8 text-cyan-400" /> Health Timeline</h1>
          <p className="dark:text-gray-400 text-gray-500 mt-1">Your projected health trajectory from now to {new Date().getFullYear() + 15}</p>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 mb-2">
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-green-500" /> Safe Zone</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Warning Zone</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-red-500" /> Danger Zone</span>
        </div>

        {/* Main Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 md:p-6 mt-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.3)" />
              <YAxis domain={[0, 100]} label={{ value: 'Health Score', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.3)" />
              <Tooltip content={<CustomTooltip />} />
              {/* Colored zones */}
              <ReferenceArea y1={70} y2={100} fill="#10b981" fillOpacity={0.05} />
              <ReferenceArea y1={40} y2={70} fill="#f59e0b" fillOpacity={0.05} />
              <ReferenceArea y1={0} y2={40} fill="#ef4444" fillOpacity={0.05} />
              {warningStart && <ReferenceLine x={warningStart} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '⚠️ Warning', position: 'top', fontSize: 11 }} />}
              {dangerStart && <ReferenceLine x={dangerStart} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '🔴 Danger', position: 'top', fontSize: 11 }} />}
              <Area type="monotone" dataKey="health" stroke="#00d4aa" strokeWidth={3} fill="url(#healthGradient)" dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.hasDanger) return <circle key={cx} cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ef4444" strokeWidth={2} />;
                if (payload.hasWarning) return <circle key={cx} cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="#f59e0b" strokeWidth={2} />;
                return <circle key={cx} cx={cx} cy={cy} r={3} fill="#00d4aa" stroke="#00d4aa" strokeWidth={1} />;
              }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Events List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
          <h2 className="text-xl font-semibold dark:text-white text-gray-800 mb-4 flex items-center gap-2"><Info className="w-5 h-5" /> Key Health Events</h2>
          <div className="space-y-2">
            {timelineData.filter(d => d.events.length > 0).map(d => (
              d.events.map((event, i) => (
                <div key={`${d.age}-${i}`} className={`glass-card p-4 flex items-center gap-4 border-l-4 ${event.severity === 'danger' ? 'border-red-500' : event.severity === 'warning' ? 'border-yellow-500' : 'border-green-500'}`}>
                  <div className="text-center min-w-[50px]">
                    <div className="text-lg font-bold dark:text-white text-gray-800">{d.age}</div>
                    <div className="text-xs dark:text-gray-500 text-gray-400">{d.year}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm dark:text-gray-200 text-gray-700">{event.event}</div>
                    <div className="text-xs dark:text-gray-500 text-gray-400">Probability: {event.probability}%</div>
                  </div>
                  {event.severity === 'danger' ? <AlertTriangle className="w-5 h-5 text-red-400" /> : event.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> : <ShieldCheck className="w-5 h-5 text-green-400" />}
                </div>
              ))
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
