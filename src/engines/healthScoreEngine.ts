// ============================================================
// VitalArc — Health Score Engine (0-100)
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
 * Score based on bio age gap.
 * Delta of -5 → 100 points
 * Delta of 0 → 80 points
 * Delta of +10 → 30 points
 * Delta of +15 → 10 points
 */
function bioAgeComponent(bioAgeResult: BiologicalAgeResult): number {
  const delta = bioAgeResult.delta;
  if (delta <= -5) return 100;
  if (delta <= 0) return 80 + ((-delta) / 5) * 20;
  if (delta <= 5) return 80 - (delta / 5) * 25;
  if (delta <= 10) return 55 - ((delta - 5) / 5) * 25;
  return Math.max(10, 30 - ((delta - 10) / 5) * 20);
}

/**
 * Score based on risk levels.
 * Average of all risk severities → mapped to 0-100.
 */
function riskComponent(risks: RiskPrediction[]): number {
  if (risks.length === 0) return 70;
  
  const avgRisk = risks.reduce((sum, r) => sum + r.tenYearRisk, 0) / risks.length;
  
  if (avgRisk < 5) return 100;
  if (avgRisk < 10) return 85;
  if (avgRisk < 20) return 65;
  if (avgRisk < 35) return 45;
  return 25;
}

/**
 * Score based on lifestyle habits.
 */
function lifestyleComponent(profile: UserProfile): number {
  let score = 0;
  const maxScore = 100;

  // Sleep (0-20)
  if (profile.sleepHours >= 7 && profile.sleepHours <= 9) score += 20;
  else if (profile.sleepHours >= 6) score += 12;
  else score += 4;

  // Exercise (0-20)
  score += clamp(profile.exerciseDaysPerWeek / 7 * 20, 0, 20);

  // Diet (0-15)
  score += clamp(profile.dietQuality / 10 * 15, 0, 15);

  // Smoking (0-20)
  if (profile.smokingStatus === 'never') score += 20;
  else if (profile.smokingStatus === 'former') score += 12;
  else score += 0;

  // Stress (0-15) - lower is better
  score += clamp((10 - profile.stressLevel) / 9 * 15, 0, 15);

  // Alcohol (0-10)
  if (profile.alcoholDrinksPerWeek <= 3) score += 10;
  else if (profile.alcoholDrinksPerWeek <= 7) score += 5;
  else score += 0;

  return clamp((score / maxScore) * 100, 0, 100);
}

/**
 * Calculate overall health score (0-100).
 */
export function calculateHealthScore(
  profile: UserProfile,
  bioAgeResult: BiologicalAgeResult,
  risks: RiskPrediction[]
): HealthScore {
  const bioScore = bioAgeComponent(bioAgeResult);
  const riskScore = riskComponent(risks);
  const lifeScore = lifestyleComponent(profile);

  const overall = Math.round(
    bioScore * 0.40 + riskScore * 0.30 + lifeScore * 0.30
  );

  const finalScore = clamp(overall, 0, 100);

  return {
    overall: finalScore,
    grade: getGrade(finalScore),
    breakdown: {
      bioAgeScore: Math.round(bioScore),
      riskScore: Math.round(riskScore),
      lifestyleScore: Math.round(lifeScore),
    },
  };
}
