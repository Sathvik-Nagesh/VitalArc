// ============================================================
// VitalArc — Simulation Engine
// ============================================================

import { UserProfile, SimulationResult, HabitChange, TimelineEvent, SimulatorValues } from '@/lib/types';
import { calculateBiologicalAge } from './bioAgeEngine';
import { calculateHealthScore } from './healthScoreEngine';
import { calculateRisks } from './riskEngine';

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
 * Generate timeline events based on risk predictions.
 */
function generateTimelineEvents(
  profile: UserProfile,
  currentYear: number
): TimelineEvent[] {
  const risks = calculateRisks(profile);
  const events: TimelineEvent[] = [];

  for (const risk of risks) {
    // Generate events based on risk trajectory
    for (let yearOffset = 1; yearOffset <= 15; yearOffset++) {
      const futureAge = profile.age + yearOffset;
      const futureYear = currentYear + yearOffset;
      
      // Probability increases with time based on risk level
      const baseProb = risk.tenYearRisk / 100;
      const yearFactor = yearOffset / 10;
      const cumulativeProb = Math.min(baseProb * yearFactor * 1.5, 0.95);

      let severity: 'safe' | 'warning' | 'danger';
      if (cumulativeProb < 0.15) severity = 'safe';
      else if (cumulativeProb < 0.35) severity = 'warning';
      else severity = 'danger';

      // Only add significant events
      if (
        (severity === 'warning' && yearOffset % 2 === 0) ||
        (severity === 'danger' && yearOffset % 3 === 0) ||
        (yearOffset === 5 || yearOffset === 10 || yearOffset === 15)
      ) {
        let eventDesc = '';
        if (severity === 'danger') {
          eventDesc = `High ${risk.shortName} risk zone — may require medical intervention`;
        } else if (severity === 'warning') {
          eventDesc = `Elevated ${risk.shortName} risk — lifestyle changes recommended`;
        } else {
          eventDesc = `${risk.shortName} within manageable range`;
        }

        events.push({
          age: futureAge,
          year: futureYear,
          event: eventDesc,
          severity,
          riskType: risk.shortName,
          probability: Math.round(cumulativeProb * 100),
        });
      }
    }
  }

  // Sort by age
  events.sort((a, b) => a.age - b.age);
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

  // Original calculations
  const originalBioAge = calculateBiologicalAge(profile);
  const originalRisks = calculateRisks(profile);
  const originalScore = calculateHealthScore(profile, originalBioAge, originalRisks);

  // Modified profile
  const modifiedProfile = applySimulatorValues(profile, simulatorValues);
  const newBioAge = calculateBiologicalAge(modifiedProfile);
  const newRisks = calculateRisks(modifiedProfile);
  const newScore = calculateHealthScore(modifiedProfile, newBioAge, newRisks);

  // Timeline for modified profile
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

/**
 * Test each habit independently to rank impact.
 */
export function rankHabitImpacts(profile: UserProfile): HabitChange[] {
  const baselineValues: SimulatorValues = {
    sleepHours: profile.sleepHours,
    exerciseDaysPerWeek: profile.exerciseDaysPerWeek,
    dietQuality: profile.dietQuality,
    stressLevel: profile.stressLevel,
    smokingStatus: profile.smokingStatus,
  };

  const baseline = runSimulation(profile, baselineValues);

  // Define optimal targets for each habit
  const habitTests: { habit: string; label: string; icon: string; values: Partial<SimulatorValues> }[] = [
    { habit: 'sleep', label: 'Improve Sleep to 8 hours', icon: 'Moon', values: { sleepHours: 8 } },
    { habit: 'exercise', label: 'Exercise 5 days/week', icon: 'Dumbbell', values: { exerciseDaysPerWeek: 5 } },
    { habit: 'diet', label: 'Improve Diet Quality to 8/10', icon: 'Utensils', values: { dietQuality: 8 } },
    { habit: 'stress', label: 'Reduce Stress to 3/10', icon: 'Smile', values: { stressLevel: 3 } },
  ];

  // Add smoking cessation if applicable
  if (profile.smokingStatus === 'current') {
    habitTests.push({
      habit: 'smoking',
      label: 'Quit Smoking',
      icon: 'Ban',
      values: { smokingStatus: 'never' },
    });
  }

  const impacts: HabitChange[] = habitTests.map(test => {
    const modifiedValues = { ...baselineValues, ...test.values };
    const sim = runSimulation(profile, modifiedValues);

    const bioAgeImpact = baseline.originalBioAge - sim.newBioAge;
    const scoreImpact = sim.newScore - baseline.originalScore;
    const riskReduction = baseline.originalRisks.reduce((sum, r, i) =>
      sum + (r.tenYearRisk - sim.newRisks[i].tenYearRisk), 0
    ) / baseline.originalRisks.length;

    return {
      habit: test.habit,
      label: test.label,
      bioAgeImpact: Math.round(bioAgeImpact * 10) / 10,
      scoreImpact: Math.round(scoreImpact),
      riskReduction: Math.round(riskReduction * 10) / 10,
      rank: 0, // will be set after sorting
      icon: test.icon,
    };
  });

  // Sort by total impact (bio age + score combined)
  impacts.sort((a, b) => {
    const totalA = a.bioAgeImpact * 2 + a.scoreImpact * 0.1 + a.riskReduction;
    const totalB = b.bioAgeImpact * 2 + b.scoreImpact * 0.1 + b.riskReduction;
    return totalB - totalA;
  });

  impacts.forEach((impact, index) => {
    impact.rank = index + 1;
  });

  return impacts;
}
