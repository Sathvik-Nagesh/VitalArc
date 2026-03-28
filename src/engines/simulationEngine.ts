// ============================================================
// VitalArc — Simulation Engine v2
// Clean milestone timelines, memoized habit impact ranking
// ============================================================

import { UserProfile, SimulationResult, HabitChange, TimelineEvent, SimulatorValues } from '@/lib/types';
import { calculateBiologicalAge } from './bioAgeEngine';
import { calculateHealthScore } from './healthScoreEngine';
import { calculateRisks } from './riskEngine';
import { clamp } from '@/lib/utils';

/**
 * Apply simulator values to a copy of the user profile.
 */
function applySimulatorValues(profile: UserProfile, sim: SimulatorValues): UserProfile {
  return {
    ...profile,
    sleepHours: sim.sleepHours,
    exerciseDaysPerWeek: sim.exerciseDaysPerWeek,
    dietQuality: sim.dietQuality,
    stressLevel: sim.stressLevel,
    smokingStatus: sim.smokingStatus,
  };
}

/**
 * Generate clean milestone timeline events.
 * Produces exactly 8-10 meaningful milestones, not noisy repetitive events.
 */
function generateTimelineEvents(
  profile: UserProfile,
  currentYear: number
): TimelineEvent[] {
  const risks = calculateRisks(profile);
  const bioAge = calculateBiologicalAge(profile);
  const events: TimelineEvent[] = [];

  // Milestone years to check (5 and 10 year checkpoints, plus interesting transitions)
  const milestoneOffsets = [1, 2, 3, 5, 7, 10, 13, 15];

  for (const yearOffset of milestoneOffsets) {
    const futureAge = profile.age + yearOffset;
    const futureYear = currentYear + yearOffset;

    // Pick the most critical risk at this time point
    const dominantRisk = risks.reduce((worst, r) => {
      const progression = r.tenYearRisk * (yearOffset / 10);
      const worstProgression = worst.tenYearRisk * (yearOffset / 10);
      return progression > worstProgression ? r : worst;
    });

    const cumulativeProb = clamp(
      dominantRisk.tenYearRisk * (yearOffset / 10) / 100,
      0.01, 0.95
    );

    let severity: 'safe' | 'warning' | 'danger';
    if (cumulativeProb < 0.12) severity = 'safe';
    else if (cumulativeProb < 0.30) severity = 'warning';
    else severity = 'danger';

    // Generate contextual event description
    let event = '';
    if (yearOffset === 1) {
      const quickWin = bioAge.delta > 2 ? 'Biological age gap widens if no habit changes made.' : 'Good trajectory — maintain current habits for best outcome.';
      event = quickWin;
    } else if (yearOffset === 2) {
      event = severity === 'safe'
        ? `${dominantRisk.condition} risk remains well-controlled (${dominantRisk.fiveYearRisk.toFixed(0)}% 5yr risk).`
        : `${dominantRisk.condition} risk rising — early intervention window is now.`;
    } else if (yearOffset === 3) {
      event = `Lifestyle habits lock in long-term organ aging trajectory. ${dominantRisk.shortName} risk: ${(cumulativeProb * 100).toFixed(0)}%.`;
    } else if (yearOffset === 5) {
      event = severity === 'danger'
        ? `5-Year Checkpoint: High ${dominantRisk.condition} risk (${dominantRisk.tenYearRisk.toFixed(0)}%) — medical screening recommended.`
        : `5-Year Checkpoint: ${dominantRisk.condition} within manageable range. Keep habits consistent.`;
    } else if (yearOffset === 7) {
      event = `Cumulative lifestyle impact becomes measurable in biological age markers.`;
    } else if (yearOffset === 10) {
      event = severity === 'danger'
        ? `10-Year Risk Zone: ${dominantRisk.condition} at ${dominantRisk.tenYearRisk.toFixed(0)}% — potential for medication dependency.`
        : severity === 'warning'
        ? `10-Year Mark: ${dominantRisk.condition} elevated but preventable with consistent habits.`
        : `10-Year Milestone: Strong health trajectory maintained. Biological advantage compounds.`;
    } else if (yearOffset === 13) {
      event = `Long-term compounding: ${bioAge.delta > 0 ? 'Accumulated biological debt may require medical management.' : 'Years of good habits yielding measurable longevity benefits.'}`;
    } else {
      event = severity === 'danger'
        ? `15-Year Horizon: Without intervention, ${dominantRisk.condition} likely requiring management by age ${futureAge}.`
        : `15-Year Horizon: Preventive habits in place — aging trajectory favorable at age ${futureAge}.`;
    }

    events.push({
      age: futureAge,
      year: futureYear,
      event,
      severity,
      riskType: dominantRisk.shortName,
      probability: Math.round(cumulativeProb * 100),
    });
  }

  return events;
}

/**
 * Run a full simulation with modified habits.
 */
export function runSimulation(
  profile: UserProfile,
  simulatorValues: SimulatorValues
): SimulationResult {
  const currentYear = new Date().getFullYear();

  const originalBioAge = calculateBiologicalAge(profile);
  const originalRisks = calculateRisks(profile);
  const originalScore = calculateHealthScore(profile, originalBioAge, originalRisks);

  const modifiedProfile = applySimulatorValues(profile, simulatorValues);
  const newBioAge = calculateBiologicalAge(modifiedProfile);
  const newRisks = calculateRisks(modifiedProfile);
  const newScore = calculateHealthScore(modifiedProfile, newBioAge, newRisks);

  const timelineEvents = generateTimelineEvents(modifiedProfile, currentYear);

  return {
    originalBioAge: originalBioAge.biologicalAge,
    newBioAge: newBioAge.biologicalAge,
    bioAgeDelta: Math.round((newBioAge.biologicalAge - originalBioAge.biologicalAge) * 10) / 10,
    originalScore: originalScore.overall,
    newScore: newScore.overall,
    scoreDelta: newScore.overall - originalScore.overall,
    originalRisks,
    newRisks,
    timelineEvents,
  };
}

// Memoization cache for habit impact ranking
let habitImpactCache: { profileHash: string; results: HabitChange[] } | null = null;

function hashProfile(profile: UserProfile): string {
  return [
    profile.age, profile.gender, profile.weight, profile.height,
    profile.sleepHours, profile.exerciseDaysPerWeek, profile.dietQuality,
    profile.stressLevel, profile.smokingStatus, profile.alcoholDrinksPerWeek,
    profile.systolicBP, profile.restingHeartRate,
  ].join('|');
}

/**
 * Test each habit independently to rank impact.
 * Memoized: only recalculates when profile changes.
 */
export function rankHabitImpacts(profile: UserProfile): HabitChange[] {
  const hash = hashProfile(profile);
  if (habitImpactCache?.profileHash === hash) return habitImpactCache.results;

  const baselineValues: SimulatorValues = {
    sleepHours: profile.sleepHours,
    exerciseDaysPerWeek: profile.exerciseDaysPerWeek,
    dietQuality: profile.dietQuality,
    stressLevel: profile.stressLevel,
    smokingStatus: profile.smokingStatus,
  };

  const baseline = runSimulation(profile, baselineValues);

  const habitTests: { habit: string; label: string; icon: string; values: Partial<SimulatorValues>; condition: string }[] = [
    {
      habit: 'sleep', label: 'Optimize Sleep to 8 hrs/night', icon: 'Moon',
      values: { sleepHours: 8 },
      condition: profile.sleepHours < 7 ? 'Your current sleep deficit is accelerating brain and metabolic aging.' : 'Sleep is already good — minor gains possible.',
    },
    {
      habit: 'exercise', label: 'Exercise 5 days/week', icon: 'Dumbbell',
      values: { exerciseDaysPerWeek: 5 },
      condition: profile.exerciseDaysPerWeek < 3 ? 'Physical activity is the single most impactful longevity intervention.' : 'Already active — increasing intensity would add further gains.',
    },
    {
      habit: 'diet', label: 'Improve Diet to 8/10', icon: 'Utensils',
      values: { dietQuality: 8 },
      condition: profile.dietQuality < 7 ? 'Diet quality directly drives metabolic health and cardiovascular risk.' : 'Diet is good — anti-inflammatory upgrades are next.',
    },
    {
      habit: 'stress', label: 'Reduce Stress to 3/10', icon: 'Brain',
      values: { stressLevel: 3 },
      condition: profile.stressLevel > 5 ? 'Chronic stress is the hidden accelerator of brain and cardiovascular aging.' : 'Stress is manageable — mindfulness practices compound over time.',
    },
  ];

  if (profile.smokingStatus === 'current') {
    habitTests.push({
      habit: 'smoking', label: 'Quit Smoking', icon: 'Ban',
      values: { smokingStatus: 'never' },
      condition: 'Smoking cessation is the single highest-return health intervention available.',
    });
  }

  const impacts: HabitChange[] = habitTests.map(test => {
    const modifiedValues = { ...baselineValues, ...test.values };
    const sim = runSimulation(profile, modifiedValues);

    const bioAgeImpact = Math.max(0, baseline.originalBioAge - sim.newBioAge);
    const scoreImpact = sim.newScore - baseline.originalScore;
    const riskReduction = baseline.originalRisks.reduce((sum, r, i) =>
      sum + Math.max(0, r.tenYearRisk - sim.newRisks[i].tenYearRisk), 0
    ) / baseline.originalRisks.length;

    return {
      habit: test.habit,
      label: test.label,
      bioAgeImpact: Math.round(bioAgeImpact * 10) / 10,
      scoreImpact: Math.round(scoreImpact),
      riskReduction: Math.round(riskReduction * 10) / 10,
      rank: 0,
      icon: test.icon,
      condition: test.condition,
    };
  });

  // Sort: bio-age impact is primary, risk reduction secondary
  impacts.sort((a, b) => {
    const totalA = a.bioAgeImpact * 3 + a.scoreImpact * 0.05 + a.riskReduction * 0.5;
    const totalB = b.bioAgeImpact * 3 + b.scoreImpact * 0.05 + b.riskReduction * 0.5;
    return totalB - totalA;
  });

  impacts.forEach((impact, index) => { impact.rank = index + 1; });

  habitImpactCache = { profileHash: hash, results: impacts };
  return impacts;
}
