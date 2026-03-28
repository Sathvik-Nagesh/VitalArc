'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar, Flame, TrendingUp, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DailyLog } from '@/lib/types';

export default function TrackerPage() {
  const router = useRouter();
  const { profile, dailyLogs, addDailyLog } = useHealthStore();
  const today = new Date().toISOString().split('T')[0];
  const [sleepInput, setSleepInput] = useState(7);
  const [stepsInput, setStepsInput] = useState(5000);
  const [moodInput, setMoodInput] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!profile) router.push('/'); }, [profile, router]);

  // Load today's data if exists
  useEffect(() => {
    const todayLog = dailyLogs.find(l => l.date === today);
    if (todayLog) {
      setSleepInput(todayLog.sleepHours);
      setStepsInput(todayLog.steps);
      setMoodInput(todayLog.mood);
    }
  }, [dailyLogs, today]);

  const handleSave = () => {
    const log: DailyLog = { date: today, sleepHours: sleepInput, steps: stepsInput, mood: moodInput };
    addDailyLog(log);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const todayDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedLogs.find(l => l.date === dateStr)) streak++;
      else break;
    }
    return streak;
  };

  // Last 7 days chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = dailyLogs.find(l => l.date === dateStr);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      sleep: log?.sleepHours || 0,
      steps: log ? log.steps / 1000 : 0,
      mood: log?.mood || 0,
    };
  });

  const streak = calculateStreak();
  const moods = ['😫', '😔', '😐', '🙂', '😄'];

  if (!profile) return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-2"><Calendar className="w-8 h-8 text-blue-400" /> Daily Tracker</h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">Small daily actions build lasting change</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 glass-card px-4 py-2">
              <span className="text-2xl flame-animation">🔥</span>
              <div>
                <div className="text-2xl font-black dark:text-white text-gray-800">{streak}</div>
                <div className="text-xs dark:text-gray-400 text-gray-500">day streak</div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Log Today */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold dark:text-white text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-400" /> Log Today
            </h2>

            <div className="space-y-5">
              {/* Sleep */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm dark:text-gray-300 text-gray-600">😴 Sleep Hours</label>
                  <span className="text-sm font-bold text-primary-400">{sleepInput}h</span>
                </div>
                <input type="range" min={3} max={12} step={0.5} value={sleepInput} onChange={e => setSleepInput(parseFloat(e.target.value))} className="w-full" />
              </div>

              {/* Steps */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm dark:text-gray-300 text-gray-600">🚶 Steps</label>
                  <span className="text-sm font-bold text-primary-400">{stepsInput.toLocaleString()}</span>
                </div>
                <input type="range" min={0} max={20000} step={500} value={stepsInput} onChange={e => setStepsInput(parseInt(e.target.value))} className="w-full" />
              </div>

              {/* Mood */}
              <div>
                <label className="text-sm dark:text-gray-300 text-gray-600 block mb-2">😊 Mood</label>
                <div className="flex gap-2 justify-around">
                  {moods.map((emoji, i) => (
                    <button key={i} onClick={() => setMoodInput(i + 1)} className={`text-3xl transition-all ${moodInput === i + 1 ? 'scale-125 grayscale-0' : 'opacity-40 grayscale'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className={`btn-primary w-full ${saved ? 'bg-green-500' : ''}`}>
                {saved ? '✓ Saved!' : 'Save Today\'s Log'}
              </button>
            </div>
          </motion.div>

          {/* Weekly Trend */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold dark:text-white text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Weekly Sleep Trend
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="sleep" fill="#00d4aa" radius={[4, 4, 0, 0]} name="Sleep (hrs)" />
              </BarChart>
            </ResponsiveContainer>

            <h2 className="text-lg font-semibold dark:text-white text-gray-800 mt-6 mb-4">Steps (thousands)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="steps" fill="#0047AB" radius={[4, 4, 0, 0]} name="Steps (k)" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* History */}
        {dailyLogs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <h2 className="text-lg font-semibold dark:text-white text-gray-800 mb-3">Recent Logs</h2>
            <div className="space-y-2">
              {[...dailyLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7).map(log => (
                <div key={log.date} className="glass-card p-3 flex items-center gap-4">
                  <div className="text-sm font-medium dark:text-gray-300 text-gray-600 w-24">{new Date(log.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                  <div className="flex items-center gap-4 text-sm dark:text-gray-400 text-gray-500">
                    <span>😴 {log.sleepHours}h</span>
                    <span>🚶 {log.steps.toLocaleString()}</span>
                    <span>{moods[log.mood - 1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
