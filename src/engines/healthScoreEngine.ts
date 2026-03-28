// ============================================================
// VitalArc — Health Score Engine v2 (0-100)
// Linear interpolation, no step-function cliffs
// ============================================================

import { UserProfile, HealthScore, BiologicalAgeResult, RiskPrediction } from '@/lib/types';
import { GRADE_THRESHOLDS } from '@/lib/constants';
import { clamp } from '@/lib/utils';

function getGrade(score: number): string {
  for (const [threshold, grade] of GRADE_THRESHOLDS) {
    if (score >= threshold) return grade;
  }
  return 'F';
}

/**
 * Bio-age component — linear interpolation, no cliffs.
 * delta = -10 → 100 pts | delta = 0 → 78 pts | delta = +12 → 20 pts
 */
function bioAgeComponent(bioAgeResult: BiologicalAgeResult): number {
  const d = bioAgeResult.delta;
  if (d <= -10) return 100;
  if (d <= 0)   return 78 + (Math.abs(d) / 10) * 22;   // linear: 78→100
  if (d <= 5)   return 78 - (d / 5) * 28;               // linear: 78→50
  if (d <= 12)  return 50 - ((d - 5) / 7) * 30;         // linear: 50→20
  return clamp(20 - (d - 12) * 3, 0, 20);
}

/**
 * Risk component — properly interpolated, no step cliffs.
 * Uses the highest single risk (not average) since one extreme risk matters most.
 */
function riskComponent(risks: RiskPrediction[]): number {
  if (risks.length === 0) return 75;

  // Weighted: top risk has 50% weight, rest split remaining 50%
  const sorted = [...risks].sort((a, b) => b.tenYearRisk - a.tenYearRisk);
  const topRisk = sorted[0].tenYearRisk;
  const avgOthers = sorted.slice(1).reduce((s, r) => s + r.tenYearRisk, 0) / Math.max(sorted.length - 1, 1);
  const blended = topRisk * 0.55 + avgOthers * 0.45;

  // Smooth linear interpolation across risk bands
  if (blended <= 3)  return 98 - blended * 1.0;       // 98→95
  if (blended <= 7)  return 95 - (blended - 3) * 4;   // 95→79
  if (blended <= 12) return 79 - (blended - 7) * 4.4; // 79→57
  if (blended <= 20) return 57 - (blended - 12) * 2.4; // 57→38
  if (blended <= 35) return 38 - (blended - 20) * 1.2; // 38→20
  return clamp(20 - (blended - 35) * 0.6, 0, 20);
}

/**
 * Lifestyle component — strictly proportional, no step jumps.
 */
function lifestyleComponent(profile: UserProfile): number {
  let score = 0;

  // Sleep (0–20): peak at 7-9h, linear fall-off outside
  const sleepOptimalDist = profile.sleepHours >= 7 && profile.sleepHours <= 9 ? 0
    : profile.sleepHours < 7 ? 7 - profile.sleepHours
    : profile.sleepHours - 9;
  score += Math.max(0, 20 - sleepOptimalDist * 5);

  // Exercise (0–20)
  score += clamp((profile.exerciseDaysPerWeek / 5) * 20, 0, 20);

  // Diet quality (0–15)
  score += clamp((profile.dietQuality / 10) * 15, 0, 15);

  // Smoking (0–20): binary with former as partial credit
  score += profile.smokingStatus === 'never' ? 20 : profile.smokingStatus === 'former' ? 11 : 0;

  // Stress (0–15): inverse, with smooth curve
  score += clamp(((10 - profile.stressLevel) / 9) * 15, 0, 15);

  // Alcohol (0–10): below 7/wk gets proportional score
  score += clamp(Math.max(0, 10 - profile.alcoholDrinksPerWeek) / 10 * 10, 0, 10);

  return clamp(score, 0, 100);
}

/**
 * Lifestyle bonus for beneficial lab values.
 */
function labBonus(profile: UserProfile): number {
  let bonus = 0;
  if (profile.totalCholesterol && profile.totalCholesterol < 200) bonus += 3;
  if (profile.hdlCholesterol && profile.hdlCholesterol >= 60) bonus += 3;
  if (profile.fastingGlucose && profile.fastingGlucose < 95) bonus += 3;
  if (profile.ldlCholesterol && profile.ldlCholesterol < 100) bonus += 3;
  return Math.min(bonus, 8); // cap bonus at 8 pts
}

/**
 * Calculate overall health score (0-100) with sub-scores.
 */
export function calculateHealthScore(
  profile: UserProfile,
  bioAgeResult: BiologicalAgeResult,
  risks: RiskPrediction[]
): HealthScore {
  const bioScore   = bioAgeComponent(bioAgeResult);
  const riskScore  = riskComponent(risks);
  const lifeScore  = lifestyleComponent(profile);
  const bonus      = labBonus(profile);

  // Weighted combination: bio-age is most predictive, risks and lifestyle equal
  const raw = bioScore * 0.40 + riskScore * 0.32 + lifeScore * 0.28 + bonus;
  const overall = Math.round(clamp(raw, 0, 100));

  // Compute what score would be with best habit improvement
  const bestHabitBoost = 8; // max realistic improvement from one habit
  const improvedScore = Math.round(clamp(overall + bestHabitBoost, 0, 100));

  return {
    overall,
    grade: getGrade(overall),
    improvedScore,
    breakdown: {
      bioAgeScore: Math.round(bioScore),
      riskScore:   Math.round(riskScore),
      lifestyleScore: Math.round(lifeScore),
    },
  };
}
