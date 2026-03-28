// ============================================================
// VitalArc — Weekly Trend Engine
// Analyzes daily logs to generate trend insights and streaks
// ============================================================

import { DailyLog } from '@/lib/types';

export interface TrendInsight {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changePercent: number;
  message: string;
  color: string;
}

export interface TrendReport {
  streakDays: number;
  avgSleep: number;
  avgSteps: number;
  avgMood: number;
  insights: TrendInsight[];
  weeklyScore: number; // 0-100 adherence to logged habits
  bestDay: string | null;
  worstDay: string | null;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.round(((a - b) / b) * 100 * 10) / 10;
}

/**
 * Compute streak of consecutive days with logs.
 */
function computeStreak(logs: DailyLog[]): number {
  if (!logs.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const dateCheck = new Date(today);

  while (true) {
    const isoDate = dateCheck.toISOString().split('T')[0];
    const hasLog = logs.some(l => l.date === isoDate);
    if (!hasLog) break;
    streak++;
    dateCheck.setDate(dateCheck.getDate() - 1);
    if (streak > 365) break; // safety cap
  }
  return streak;
}

/**
 * Analyze recent 7 days vs prior 7 days for trend direction.
 */
export function analyzeTrends(logs: DailyLog[]): TrendReport {
  if (!logs.length) {
    return {
      streakDays: 0, avgSleep: 0, avgSteps: 0, avgMood: 0,
      insights: [], weeklyScore: 0, bestDay: null, worstDay: null,
    };
  }

  // Sort by date descending
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const recent  = sorted.slice(0, 7);
  const previous = sorted.slice(7, 14);

  const recentSleep  = recent.map(l => l.sleepHours);
  const recentSteps  = recent.map(l => l.steps);
  const recentMood   = recent.map(l => l.mood);

  const prevSleep = previous.map(l => l.sleepHours);
  const prevSteps = previous.map(l => l.steps);
  const prevMood  = previous.map(l => l.mood);

  const avgRecentSleep = avg(recentSleep);
  const avgRecentSteps = avg(recentSteps);
  const avgRecentMood  = avg(recentMood);

  const avgPrevSleep = avg(prevSleep);
  const avgPrevSteps = avg(prevSteps);
  const avgPrevMood  = avg(prevMood);

  // Build insights
  const insights: TrendInsight[] = [];

  // Sleep insight
  const sleepChange = pct(avgRecentSleep, avgPrevSleep || avgRecentSleep);
  const sleepDir: 'improving' | 'declining' | 'stable' =
    sleepChange > 5 ? 'improving' : sleepChange < -5 ? 'declining' : 'stable';
  insights.push({
    metric: 'Sleep',
    direction: sleepDir,
    changePercent: Math.abs(sleepChange),
    message: sleepDir === 'improving'
      ? `Sleep improved ${Math.abs(sleepChange).toFixed(0)}% this week — your brain is recovering better.`
      : sleepDir === 'declining'
      ? `Sleep dropped ${Math.abs(sleepChange).toFixed(0)}% vs last week — this will impact your bio-age.`
      : `Sleep is consistent at ${avgRecentSleep.toFixed(1)} hrs/night.`,
    color: sleepDir === 'improving' ? '#10b981' : sleepDir === 'declining' ? '#ef4444' : '#f59e0b',
  });

  // Steps insight
  if (avgRecentSteps > 0) {
    const stepsChange = pct(avgRecentSteps, avgPrevSteps || avgRecentSteps);
    const stepsDir: 'improving' | 'declining' | 'stable' =
      stepsChange > 5 ? 'improving' : stepsChange < -5 ? 'declining' : 'stable';
    insights.push({
      metric: 'Activity',
      direction: stepsDir,
      changePercent: Math.abs(stepsChange),
      message: stepsDir === 'improving'
        ? `Daily steps up ${stepsChange.toFixed(0)}% — great for cardiovascular health.`
        : stepsDir === 'declining'
        ? `Activity down ${Math.abs(stepsChange).toFixed(0)}%. Even a 10-min walk helps.`
        : `Activity steady at ~${Math.round(avgRecentSteps).toLocaleString()} steps/day.`,
      color: stepsDir === 'improving' ? '#10b981' : stepsDir === 'declining' ? '#ef4444' : '#f59e0b',
    });
  }

  // Mood insight
  if (avgRecentMood > 0) {
    const moodChange = pct(avgRecentMood, avgPrevMood || avgRecentMood);
    const moodDir: 'improving' | 'declining' | 'stable' =
      moodChange > 5 ? 'improving' : moodChange < -5 ? 'declining' : 'stable';
    insights.push({
      metric: 'Mood & Wellbeing',
      direction: moodDir,
      changePercent: Math.abs(moodChange),
      message: moodDir === 'improving'
        ? `Mood trending up — mental health is a key driver of longevity.`
        : moodDir === 'declining'
        ? `Mood dipping this week. Check sleep quality and stress levels.`
        : `Mood stable. Track correlations with sleep and activity for deeper insights.`,
      color: moodDir === 'improving' ? '#8b5cf6' : moodDir === 'declining' ? '#f97316' : '#00d4aa',
    });
  }

  // Weekly adherence score (how consistent is logging and how good are the numbers)
  const sleepTarget = recentSleep.filter(s => s >= 7 && s <= 9).length;
  const stepsTarget = recentSteps.filter(s => s >= 7000).length;
  const moodTarget  = recentMood.filter(m => m >= 3).length;
  const weeklyScore = Math.round(
    ((sleepTarget / Math.max(recentSleep.length, 1)) * 40 +
     (stepsTarget / Math.max(recentSteps.length, 1)) * 40 +
     (moodTarget  / Math.max(recentMood.length,  1)) * 20)
  );

  // Best and worst day by composite score
  const dayScores = recent.map(l => ({
    date: l.date,
    score: (l.sleepHours >= 7 && l.sleepHours <= 9 ? 2 : 0) +
           (l.steps >= 7000 ? 2 : l.steps >= 4000 ? 1 : 0) +
           l.mood,
  }));
  const bestDay  = dayScores.length ? dayScores.reduce((a, b) => a.score > b.score ? a : b).date : null;
  const worstDay = dayScores.length ? dayScores.reduce((a, b) => a.score < b.score ? a : b).date : null;

  return {
    streakDays: computeStreak(logs),
    avgSleep: Math.round(avgRecentSleep * 10) / 10,
    avgSteps: Math.round(avgRecentSteps),
    avgMood: Math.round(avgRecentMood * 10) / 10,
    insights,
    weeklyScore,
    bestDay,
    worstDay,
  };
}

/**
 * Generate a bio-age re-estimate delta based on recent logs.
 * "Your recent logs suggest your bio-age is improving by X days per week."
 */
export function estimateTrendBioAgeDelta(report: TrendReport): number {
  let delta = 0;
  const { avgSleep, avgSteps, avgMood } = report;

  if (avgSleep >= 7 && avgSleep <= 9) delta -= 0.05;
  else if (avgSleep < 6) delta += 0.08;

  if (avgSteps >= 7000) delta -= 0.06;
  else if (avgSteps < 3000) delta += 0.05;

  if (avgMood >= 4) delta -= 0.03;
  else if (avgMood <= 2) delta += 0.04;

  return Math.round(delta * 10) / 10; // delta in years per week tracked
}
