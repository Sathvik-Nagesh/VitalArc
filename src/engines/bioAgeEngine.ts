// ============================================================
// VitalArc — Biological Age Engine
// ============================================================

import { UserProfile, BiologicalAgeResult, OrganAge } from '@/lib/types';
import { ORGAN_WEIGHTS, ORGAN_META, OPTIMAL_RANGES } from '@/lib/constants';
import { calculateBMI, clamp } from '@/lib/utils';

/**
 * Calculates how far a metric deviates from optimal range.
 * Returns a value from -1 (very poor) to 1 (excellent).
 */
function scoreMetric(value: number, optimal: { min: number; max: number }, inverted = false): number {
  if (value >= optimal.min && value <= optimal.max) return 1;
  
  const midpoint = (optimal.min + optimal.max) / 2;
  const range = optimal.max - optimal.min;
  const deviation = Math.abs(value - midpoint) / range;
  
  let score = 1 - deviation * 0.5;
  score = clamp(score, -1, 1);
  
  return inverted ? -score : score;
}

/**
 * Calculate all factor scores from user profile.
 */
function calculateFactorScores(profile: UserProfile) {
  const bmi = calculateBMI(profile.weight, profile.height);
  
  const scores: Record<string, number> = {
    bmi: scoreMetric(bmi, OPTIMAL_RANGES.bmi),
    sleep: scoreMetric(profile.sleepHours, OPTIMAL_RANGES.sleepHours),
    exercise: scoreMetric(profile.exerciseDaysPerWeek, OPTIMAL_RANGES.exerciseDaysPerWeek),
    diet: scoreMetric(profile.dietQuality, OPTIMAL_RANGES.dietQuality),
    smoking: profile.smokingStatus === 'never' ? 1 : profile.smokingStatus === 'former' ? 0.3 : -1,
    alcohol: scoreMetric(profile.alcoholDrinksPerWeek, OPTIMAL_RANGES.alcoholDrinksPerWeek),
    stress: scoreMetric(profile.stressLevel, OPTIMAL_RANGES.stressLevel, true),
    heartRate: scoreMetric(profile.restingHeartRate, OPTIMAL_RANGES.restingHeartRate),
    bloodPressure: scoreMetric(profile.systolicBP, OPTIMAL_RANGES.systolicBP),
    cholesterol: profile.totalCholesterol
      ? scoreMetric(profile.totalCholesterol, OPTIMAL_RANGES.totalCholesterol)
      : 0, // neutral if not provided
  };

  return scores;
}

/**
 * Convert a composite score to a bio-age delta (years).
 * Score of 1 (perfect) → delta of -5 (5 years younger)
 * Score of -1 (worst) → delta of +15 (15 years older)
 */
function scoreToDelta(compositeScore: number): number {
  // Map from [-1, 1] to [+15, -5]
  const delta = -10 * compositeScore + 5;
  return Math.round(delta * 10) / 10;
}

/**
 * Calculate organ-specific biological age.
 */
function calculateOrganAge(
  profile: UserProfile,
  organ: keyof typeof ORGAN_WEIGHTS,
  factorScores: Record<string, number>
): OrganAge {
  const weights = ORGAN_WEIGHTS[organ];
  const meta = ORGAN_META[organ];
  
  let compositeScore = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    compositeScore += (factorScores[factor] || 0) * weight;
  }

  // Family history impact
  if (organ === 'cardiovascular' && profile.familyHistory.heartDisease) {
    compositeScore -= 0.15;
  }
  if (organ === 'metabolic' && profile.familyHistory.diabetes) {
    compositeScore -= 0.15;
  }
  if (organ === 'brain' && profile.familyHistory.mentalHealth) {
    compositeScore -= 0.10;
  }

  const delta = scoreToDelta(compositeScore);
  const age = Math.round((profile.age + delta) * 10) / 10;

  return {
    organ,
    label: meta.label,
    age: Math.max(age, profile.age * 0.6), // floor: no younger than 60% of real age
    delta: Math.round((age - profile.age) * 10) / 10,
    icon: meta.icon,
    color: meta.color,
  };
}

/**
 * Main function: Calculate full biological age result from a user profile.
 */
export function calculateBiologicalAge(profile: UserProfile): BiologicalAgeResult {
  const factorScores = calculateFactorScores(profile);

  // Overall bio age - weighted average of all factors
  const overallWeights: Record<string, number> = {
    bmi: 0.12, sleep: 0.15, exercise: 0.15, diet: 0.10,
    smoking: 0.15, alcohol: 0.05, stress: 0.10,
    heartRate: 0.05, bloodPressure: 0.08, cholesterol: 0.05,
  };

  let overallComposite = 0;
  for (const [factor, weight] of Object.entries(overallWeights)) {
    overallComposite += (factorScores[factor] || 0) * weight;
  }

  // Family history penalty
  const familyPenalty = Object.values(profile.familyHistory).filter(Boolean).length * 0.03;
  overallComposite -= familyPenalty;

  const overallDelta = scoreToDelta(overallComposite);
  const biologicalAge = Math.round((profile.age + overallDelta) * 10) / 10;

  // Calculate organ ages
  const organs: (keyof typeof ORGAN_WEIGHTS)[] = [
    'cardiovascular', 'brain', 'metabolic', 'musculoskeletal'
  ];
  const organAges = organs.map(organ => calculateOrganAge(profile, organ, factorScores));

  // Build factors report
  const factorLabels: Record<string, string> = {
    bmi: 'Body Mass Index',
    sleep: 'Sleep Quality',
    exercise: 'Physical Activity',
    diet: 'Diet Quality',
    smoking: 'Smoking Status',
    alcohol: 'Alcohol Consumption',
    stress: 'Stress Level',
    heartRate: 'Resting Heart Rate',
    bloodPressure: 'Blood Pressure',
    cholesterol: 'Cholesterol Levels',
  };

  const factors = Object.entries(factorScores).map(([name, score]) => ({
    name: factorLabels[name] || name,
    impact: Math.round(score * overallWeights[name] * -10 * 10) / 10,
    status: (score > 0.5 ? 'good' : score > -0.2 ? 'moderate' : 'poor') as 'good' | 'moderate' | 'poor',
  }));

  return {
    chronologicalAge: profile.age,
    biologicalAge: Math.max(biologicalAge, profile.age * 0.6),
    delta: Math.round((biologicalAge - profile.age) * 10) / 10,
    organAges,
    factors,
  };
}
